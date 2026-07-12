-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "role" TEXT,
    "organization" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetIssuedAt" DATETIME,
    "passwordResetRedeemedAt" DATETIME,
    CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_organization_fkey" FOREIGN KEY ("organization") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
    "canManageRooms" BOOLEAN NOT NULL DEFAULT false,
    "canApproveBookings" BOOLEAN NOT NULL DEFAULT false,
    "canBookRooms" BOOLEAN NOT NULL DEFAULT false,
    "canManageRoles" BOOLEAN NOT NULL DEFAULT false,
    "canAccessDashboard" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "capacity" INTEGER NOT NULL,
    "facilities" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user" TEXT,
    "organization" TEXT,
    "room" TEXT,
    "date" TEXT NOT NULL DEFAULT '',
    "startTime" TEXT NOT NULL DEFAULT '',
    "endTime" TEXT NOT NULL DEFAULT '',
    "status" TEXT DEFAULT 'MENUNGGU',
    "reason" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Booking_user_fkey" FOREIGN KEY ("user") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_organization_fkey" FOREIGN KEY ("organization") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_room_fkey" FOREIGN KEY ("room") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking" TEXT,
    "admin" TEXT,
    "status" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "approvedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Approval_booking_fkey" FOREIGN KEY ("booking") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Approval_admin_fkey" FOREIGN KEY ("admin") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_organization_idx" ON "User"("organization");

-- CreateIndex
CREATE INDEX "Booking_user_idx" ON "Booking"("user");

-- CreateIndex
CREATE INDEX "Booking_organization_idx" ON "Booking"("organization");

-- CreateIndex
CREATE INDEX "Booking_room_idx" ON "Booking"("room");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_booking_key" ON "Approval"("booking");

-- CreateIndex
CREATE INDEX "Approval_admin_idx" ON "Approval"("admin");
