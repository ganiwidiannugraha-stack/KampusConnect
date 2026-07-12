# commands.md — KampusConnect

Daftar command yang sering dipakai selama development. Update file ini kalau ada command baru
yang jadi rutin dipakai.

## Setup Awal

```bash
# Clone & install dependencies (monorepo, dijalankan dari root)
npm install

# Setup environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Jalankan database via Docker
docker compose up -d postgres

# Migrasi database
cd apps/api && npx prisma migrate dev

# Seed data dummy (ruang, user contoh, UKM)
cd apps/api && npx prisma db seed
```

## Development

```bash
# Jalankan backend (port 4000)
cd apps/api && npm run dev

# Jalankan frontend (port 5173)
cd apps/web && npm run dev

# Jalankan keduanya sekaligus dari root (kalau pakai concurrently/turborepo)
npm run dev
```

## Database (Prisma)

```bash
# Buat migrasi baru setelah ubah schema.prisma
npx prisma migrate dev --name nama_perubahan

# Lihat data lewat GUI
npx prisma studio

# Reset database (HATI-HATI: hapus semua data)
npx prisma migrate reset

# Generate Prisma Client setelah ubah schema
npx prisma generate
```

## Testing

```bash
# Unit + integration test backend
cd apps/api && npm run test

# Test dengan coverage report
npm run test:coverage

# Test khusus modul booking (yang paling sering ditanya saat sidang)
npm run test -- booking
```

## Build & Production Check

```bash
# Build frontend untuk production
cd apps/web && npm run build

# Preview hasil build
npm run preview

# Lint check sebelum commit
npm run lint
```

## Sebelum Presentasi/Demo

```bash
# Reset DB ke kondisi bersih + seed data demo yang representatif
npx prisma migrate reset --force
npx prisma db seed

# Pastikan tidak ada console.log atau data dummy aneh tertinggal
grep -r "console.log" apps/web/src apps/api/src

# Cek tidak ada .env ter-commit
git status --ignored
```

## Git Workflow

```bash
git checkout -b feat/nama-fitur
git add .
git commit -m "feat: deskripsi singkat dan jelas"
git push origin feat/nama-fitur
```
