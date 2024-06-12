/*
  Warnings:

  - You are about to drop the `airline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `airport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `flight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `passenger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_user_id_fkey";

-- DropForeignKey
ALTER TABLE "flight" DROP CONSTRAINT "flight_airline_id_fkey";

-- DropForeignKey
ALTER TABLE "flight" DROP CONSTRAINT "flight_from_airport_id_fkey";

-- DropForeignKey
ALTER TABLE "flight" DROP CONSTRAINT "flight_to_airport_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_flight_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket" DROP CONSTRAINT "ticket_passenger_id_fkey";

-- DropTable
DROP TABLE "airline";

-- DropTable
DROP TABLE "airport";

-- DropTable
DROP TABLE "booking";

-- DropTable
DROP TABLE "flight";

-- DropTable
DROP TABLE "passenger";

-- DropTable
DROP TABLE "payment";

-- DropTable
DROP TABLE "ticket";

-- CreateTable
CREATE TABLE "Airport" (
    "id" SERIAL NOT NULL,
    "name_airport" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "time_zone" TEXT NOT NULL,
    "iata_code" TEXT NOT NULL,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" SERIAL NOT NULL,
    "departure_airport_id" INTEGER NOT NULL,
    "arrival_airport_id" INTEGER NOT NULL,
    "airline_id" INTEGER NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "flight_number" TEXT NOT NULL,
    "free_baggage" INTEGER NOT NULL,
    "cabin_baggage" INTEGER NOT NULL,
    "duration_minute" INTEGER NOT NULL,
    "class" TEXT NOT NULL,
    "is_sunday" BOOLEAN NOT NULL,
    "is_monday" BOOLEAN NOT NULL,
    "is_tuesday" BOOLEAN NOT NULL,
    "is_wednesday" BOOLEAN NOT NULL,
    "is_thursday" BOOLEAN NOT NULL,
    "is_friday" BOOLEAN NOT NULL,
    "is_saturday" BOOLEAN NOT NULL,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Airline" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,
    "iata_code" TEXT NOT NULL,

    CONSTRAINT "Airline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Airplane" (
    "id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "seat_layout" TEXT NOT NULL,
    "seat_pitch" INTEGER NOT NULL,
    "seat_type" TEXT NOT NULL,
    "seat_amount" INTEGER NOT NULL,
    "airline_id" INTEGER NOT NULL,

    CONSTRAINT "Airplane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "flight_id" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL,
    "total_passenger" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "passenger_id" INTEGER NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "ticket_number" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "id_passport_number" TEXT NOT NULL,
    "citizenship" TEXT NOT NULL,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_departure_airport_id_fkey" FOREIGN KEY ("departure_airport_id") REFERENCES "Airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_arrival_airport_id_fkey" FOREIGN KEY ("arrival_airport_id") REFERENCES "Airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "Airline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Airplane" ADD CONSTRAINT "Airplane_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "Airline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "Passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
