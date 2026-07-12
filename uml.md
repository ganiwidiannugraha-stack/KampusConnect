# uml.md — Diagram Pendukung Sidang KampusConnect

Diagram di sini fokus pada dua hal yang paling sering digali penguji: **state machine status
booking** dan **algoritma deteksi bentrok**. Untuk diagram lengkap (Use Case, Sequence, ERD,
Class) lihat `UML_KampusConnect.html`.

Format menggunakan Mermaid — bisa langsung di-render di GitHub, GitLab, Notion, atau VS Code
dengan extension Mermaid.

---

## 1. State Machine — Status Booking

```mermaid
stateDiagram-v2
    [*] --> MENUNGGU: User submit booking
    MENUNGGU --> DISETUJUI: Admin approve
    MENUNGGU --> DITOLAK: Admin reject
    MENUNGGU --> DIBATALKAN: User batalkan (maks H-1)
    DISETUJUI --> DIBATALKAN: User batalkan (maks H-1)
    DITOLAK --> [*]
    DIBATALKAN --> [*]
    DISETUJUI --> [*]: Selesai (tanggal lewat)

    note right of MENUNGGU
        Slot dianggap "dipesan"
        meski belum di-approve,
        mencegah dua UKM
        menunggu approval
        di slot sama
    end note

    note right of DITOLAK
        Final state.
        Tidak bisa diubah
        jadi DISETUJUI lagi.
        User harus booking ulang.
    end note
```

---

## 2. Activity Diagram — Algoritma Cek Bentrok (Detail)

```mermaid
flowchart TD
    A([User submit form booking]) --> B[Backend terima request]
    B --> C{Validasi field wajib lengkap?}
    C -->|Tidak| C1[Return 400: field tidak lengkap]
    C1 --> Z([End])
    C -->|Ya| D[Mulai database transaction]
    D --> E[Query booking existing\npada room_id + date yang sama\nstatus IN MENUNGGU, DISETUJUI]
    E --> F{Ada overlap waktu?\nstart_baru < end_existing\nDAN end_baru > start_existing}
    F -->|Ya, bentrok| G[Rollback transaction]
    G --> G1[Return 409 Conflict\n+ detail slot yang bentrok]
    G1 --> Z
    F -->|Tidak bentrok| H[Cek jumlah booking aktif UKM]
    H --> I{Sudah 3 booking aktif?}
    I -->|Ya| I1[Rollback transaction]
    I1 --> I2[Return 422\nmaks booking aktif tercapai]
    I2 --> Z
    I -->|Belum| J[INSERT booking baru\nstatus = MENUNGGU]
    J --> K[Commit transaction]
    K --> L[Trigger notifikasi ke Admin]
    L --> M[Trigger notifikasi konfirmasi ke User]
    M --> N([Return 201 Created])
```

**Catatan penting untuk dijelaskan:** Validasi overlap dan insert booking terjadi dalam **satu
database transaction** yang sama. Ini krusial — kalau dipisah jadi dua query terpisah (cek
dulu, baru insert), ada window waktu di antaranya yang rentan race condition. Dengan
transaction + exclusion constraint di level database, window itu tertutup.

---

## 3. Sequence Diagram — Skenario Race Condition (2 User Bersamaan)

```mermaid
sequenceDiagram
    actor U1 as UKM A
    actor U2 as UKM B
    participant API as Backend API
    participant DB as PostgreSQL

    U1->>API: POST /bookings (Ruang X, 08:00-10:00)
    U2->>API: POST /bookings (Ruang X, 09:00-11:00)
    
    Note over API: Kedua request masuk\nhampir bersamaan
    
    API->>DB: BEGIN TRANSACTION (req UKM A)
    API->>DB: BEGIN TRANSACTION (req UKM B)
    
    DB->>DB: INSERT booking UKM A
    Note over DB: Exclusion constraint cek dulu
    DB-->>API: Sukses, COMMIT
    API-->>U1: 201 Created
    
    DB->>DB: INSERT booking UKM B
    Note over DB: Exclusion constraint DETECT OVERLAP\ndengan booking UKM A yang baru commit
    DB-->>API: ERROR: constraint violation
    API->>API: Catch error, format response
    API-->>U2: 409 Conflict\n"Slot sudah dipesan UKM A"
```

---

## 4. Class Diagram Ringkas — Service Layer (Tempat Logic Bentrok)

```mermaid
classDiagram
    class BookingController {
        +createBooking(req, res)
        +getBookings(req, res)
        +updateStatus(req, res)
        +cancelBooking(req, res)
    }
    
    class BookingService {
        -prisma: PrismaClient
        -notificationService: NotificationService
        +createBooking(dto) Booking
        +checkRoomConflict(roomId, date, start, end) boolean
        +countActiveBookings(orgId) number
        +approveBooking(id, adminId) Booking
        +rejectBooking(id, adminId, reason) Booking
        +cancelBooking(id, userId) Booking
        -validateStatusTransition(current, target) void
    }
    
    class NotificationService {
        +sendBookingSubmitted(booking)
        +sendApprovalResult(booking)
        +sendReminder(booking)
    }
    
    class BookingRepository {
        +findOverlapping(roomId, date, start, end) Booking[]
        +countActiveByOrg(orgId) number
        +create(data) Booking
        +updateStatus(id, status) Booking
    }

    BookingController --> BookingService : delegates to
    BookingService --> NotificationService : triggers on success
    BookingService --> BookingRepository : queries via Prisma
```

**Catatan arsitektur:** `checkRoomConflict()` dan `validateStatusTransition()` sengaja
ditaruh di `BookingService`, bukan di controller atau langsung di route handler. Alasannya:
business logic harus testable secara terisolasi (unit test tanpa perlu spin up HTTP server),
dan controller harus tetap "tipis" — cuma menerjemahkan HTTP request/response.

---

## 5. ERD Fokus — Relasi yang Sering Ditanya

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "membuat"
    USERS }o--|| ORGANIZATIONS : "anggota dari"
    ORGANIZATIONS ||--o{ BOOKINGS : "atas nama"
    ROOMS ||--o{ BOOKINGS : "dipesan untuk"
    BOOKINGS ||--o| APPROVALS : "dicatat di"
    USERS ||--o{ APPROVALS : "memutuskan (admin)"
    USERS ||--o{ NOTIFICATIONS : "menerima"
    BOOKINGS ||--o{ NOTIFICATIONS : "memicu"

    USERS {
        uuid id PK
        string nim
        string email
        string role
        uuid organization_id FK
        boolean is_active
    }
    ROOMS {
        uuid id PK
        string name
        int capacity
        boolean is_active
    }
    BOOKINGS {
        uuid id PK
        uuid user_id FK
        uuid room_id FK
        uuid organization_id FK
        date date
        time start_time
        time end_time
        string status
    }
    APPROVALS {
        uuid id PK
        uuid booking_id FK
        uuid admin_id FK
        string action
        text notes
    }
```

**Kenapa `organization_id` ada di dua tempat (USERS dan BOOKINGS)?**
Pertanyaan yang sering muncul. Jawaban: `users.organization_id` menunjukkan UKM mana user itu
anggotanya (data keanggotaan). `bookings.organization_id` dicatat terpisah karena kalau user
pindah/keluar dari UKM di kemudian hari, histori booking tetap menunjukkan booking itu
dilakukan atas nama UKM yang benar saat itu — bukan ikut berubah mengikuti UKM user saat ini.
Ini disebut **denormalisasi yang disengaja** untuk menjaga akurasi historis.
