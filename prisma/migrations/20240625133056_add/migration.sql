/*
  Warnings:

  - Added the required column `admin_tax` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ppn_tax` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "admin_tax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ppn_tax" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "return_schedule_id" TEXT;
