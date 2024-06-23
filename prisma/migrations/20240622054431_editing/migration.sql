-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_schedule_id_fkey";

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
