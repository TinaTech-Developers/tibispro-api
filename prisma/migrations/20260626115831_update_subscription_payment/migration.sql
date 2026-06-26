/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `SubscriptionPayment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `SubscriptionPayment` table without a default value. This is not possible if the table is not empty.
  - Made the column `reference` on table `SubscriptionPayment` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('ECOCASH', 'ONEMONEY', 'BANK');

-- AlterTable
ALTER TABLE "SubscriptionPayment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedBy" TEXT,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'ECOCASH',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "reference" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_reference_key" ON "SubscriptionPayment"("reference");
