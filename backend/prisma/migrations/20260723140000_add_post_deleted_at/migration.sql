-- AlterTable
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_userId_deletedAt_idx" ON "Post"("userId", "deletedAt");
