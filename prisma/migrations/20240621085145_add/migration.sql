-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_attempts" INTEGER DEFAULT 0,
ADD COLUMN     "last_verification_attempt" TIMESTAMP(3),
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL;
