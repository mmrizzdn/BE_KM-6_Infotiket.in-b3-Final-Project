-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "total_adult_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "total_child_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "total_infant_price" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
