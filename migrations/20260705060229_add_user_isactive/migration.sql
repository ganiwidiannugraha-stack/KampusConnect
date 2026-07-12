-- AlterTable
ALTER TABLE "Room" ADD COLUMN "images" TEXT DEFAULT '[]';

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "role" TEXT,
    "organization" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordResetToken" TEXT,
    "passwordResetIssuedAt" DATETIME,
    "passwordResetRedeemedAt" DATETIME,
    CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_organization_fkey" FOREIGN KEY ("organization") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "id", "name", "organization", "password", "passwordResetIssuedAt", "passwordResetRedeemedAt", "passwordResetToken", "role") SELECT "email", "id", "name", "organization", "password", "passwordResetIssuedAt", "passwordResetRedeemedAt", "passwordResetToken", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_organization_idx" ON "User"("organization");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
