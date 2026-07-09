-- CreateEnum
CREATE TYPE "HashtagMode" AS ENUM ('MANUAL', 'AUTO', 'NONE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "hashtagMode" "HashtagMode" NOT NULL DEFAULT 'AUTO',
ADD COLUMN     "hashtags" TEXT[],
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';
