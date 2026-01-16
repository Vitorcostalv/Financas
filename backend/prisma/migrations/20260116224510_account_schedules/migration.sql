-- AlterTable
ALTER TABLE "Account" ADD COLUMN "valueMode" TEXT NOT NULL DEFAULT 'FIXED';
ALTER TABLE "Account" ADD COLUMN "startDate" DATETIME;
ALTER TABLE "Account" ADD COLUMN "endDate" DATETIME;
ALTER TABLE "Account" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "AccountSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountSchedule_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- DropTable
DROP TABLE IF EXISTS "RecurringRule";
