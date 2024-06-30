/*
  Warnings:

  - Added the required column `booking_id` to the `passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `booking_id` to the `ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_ticket_id_fkey";

-- AlterTable
ALTER TABLE "passenger" ADD COLUMN     "booking_id" INTEGER NOT NULL,
ALTER COLUMN "id_passport_number" DROP NOT NULL,
ALTER COLUMN "citizenship" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "booking_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger" ADD CONSTRAINT "passenger_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
