/*
  Warnings:

  - You are about to drop the `Airline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Airplane` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Airport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Flight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Passenger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Airplane" DROP CONSTRAINT "Airplane_airline_id_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Flight" DROP CONSTRAINT "Flight_airline_id_fkey";

-- DropForeignKey
ALTER TABLE "Flight" DROP CONSTRAINT "Flight_arrival_airport_id_fkey";

-- DropForeignKey
ALTER TABLE "Flight" DROP CONSTRAINT "Flight_departure_airport_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_flight_id_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_passenger_id_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_schedule_id_fkey";

-- DropTable
DROP TABLE "Airline";

-- DropTable
DROP TABLE "Airplane";

-- DropTable
DROP TABLE "Airport";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Flight";

-- DropTable
DROP TABLE "Passenger";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Schedule";

-- DropTable
DROP TABLE "Ticket";

-- CreateTable
CREATE TABLE "airport" (
    "id" SERIAL NOT NULL,
    "name_airport" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "time_zone" TEXT NOT NULL,
    "iata_code" TEXT NOT NULL,

    CONSTRAINT "airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight" (
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

    CONSTRAINT "flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airline" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "icon_url" TEXT,
    "iata_code" TEXT NOT NULL,

    CONSTRAINT "airline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airplane" (
    "id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "seat_layout" TEXT,
    "seat_pitch" INTEGER,
    "seat_type" TEXT,
    "seat_amount" INTEGER NOT NULL,
    "airline_id" INTEGER NOT NULL,

    CONSTRAINT "airplane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "id" SERIAL NOT NULL,
    "flight_id" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL,
    "total_passenger" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "passenger_id" INTEGER NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "ticket_number" TEXT NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "id_passport_number" TEXT NOT NULL,
    "citizenship" TEXT NOT NULL,

    CONSTRAINT "passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_departure_airport_id_fkey" FOREIGN KEY ("departure_airport_id") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_arrival_airport_id_fkey" FOREIGN KEY ("arrival_airport_id") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airplane" ADD CONSTRAINT "airplane_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
