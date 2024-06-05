-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_departure_airport_id_fkey" FOREIGN KEY ("departure_airport_id") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_arrival_airport_id_fkey" FOREIGN KEY ("arrival_airport_id") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
