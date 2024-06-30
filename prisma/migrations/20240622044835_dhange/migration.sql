/*
  Warnings:

  - The primary key for the `schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `merchant_ref` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_schedule_id_fkey";

-- AlterTable
ALTER TABLE "booking" ALTER COLUMN "schedule_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "merchant_ref" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "schedule_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "schedule_id_seq";

-- AlterTable
ALTER TABLE "ticket" ALTER COLUMN "schedule_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
