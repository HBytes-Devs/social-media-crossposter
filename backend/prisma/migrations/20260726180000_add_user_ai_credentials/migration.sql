-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('MINIMAX', 'OPENAI', 'ANTHROPIC', 'CUSTOM');

-- CreateTable
CREATE TABLE "UserAiCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" "AiProvider" NOT NULL,
    "apiKeyEnc" TEXT NOT NULL,
    "baseUrl" TEXT,
    "model" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAiCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAiCredential_userId_idx" ON "UserAiCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAiCredential_userId_name_key" ON "UserAiCredential"("userId", "name");

-- AddForeignKey
ALTER TABLE "UserAiCredential" ADD CONSTRAINT "UserAiCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
