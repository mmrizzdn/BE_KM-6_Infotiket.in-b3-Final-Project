/*
  Warnings:

  - You are about to drop the column `flight_id` on the `schedule` table. All the data in the column will be lost.
  - Added the required column `Date` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `airline_id` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrival_airport_id` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrival_time` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cabin_baggage` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departure_airport_id` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departure_time` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration_minute` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flight_number` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `free_baggage` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_flight_id_fkey";

-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "flight_id",
ADD COLUMN     "Date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "airline_id" INTEGER NOT NULL,
ADD COLUMN     "arrival_airport_id" INTEGER NOT NULL,
ADD COLUMN     "arrival_time" TEXT NOT NULL,
ADD COLUMN     "cabin_baggage" INTEGER NOT NULL,
ADD COLUMN     "class" TEXT NOT NULL,
ADD COLUMN     "departure_airport_id" INTEGER NOT NULL,
ADD COLUMN     "departure_time" TEXT NOT NULL,
ADD COLUMN     "duration_minute" INTEGER NOT NULL,
ADD COLUMN     "flight_number" TEXT NOT NULL,
ADD COLUMN     "free_baggage" INTEGER NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "seat_available" INTEGER NOT NULL DEFAULT 25;
