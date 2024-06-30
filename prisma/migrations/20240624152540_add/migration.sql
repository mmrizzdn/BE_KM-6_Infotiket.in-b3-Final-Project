/*
  Warnings:

  - You are about to drop the column `full_name` on the `passenger` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `passenger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "passenger" DROP COLUMN "full_name",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT NOT NULL;
