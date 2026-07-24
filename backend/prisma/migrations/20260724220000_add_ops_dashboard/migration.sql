-- AlterTable
ALTER TABLE "User" ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum
CREATE TYPE "UserActivityAction" AS ENUM ('LOGIN', 'API', 'POST_CREATE', 'POST_PUBLISH', 'ADMIN_ACTION');
CREATE TYPE "SupportIssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE "SupportIssueSource" AS ENUM ('MANUAL', 'PUBLISH_FAIL', 'SYSTEM');

-- CreateTable
CREATE TABLE "UserActivityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "UserActivityAction" NOT NULL,
    "path" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivityEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SystemErrorLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'error',
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "path" TEXT,
    "userId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemErrorLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportIssue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "SupportIssueStatus" NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "source" "SupportIssueSource" NOT NULL DEFAULT 'MANUAL',
    "userId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_isSuspended_idx" ON "User"("isSuspended");
CREATE INDEX "UserActivityEvent_userId_createdAt_idx" ON "UserActivityEvent"("userId", "createdAt");
CREATE INDEX "UserActivityEvent_action_createdAt_idx" ON "UserActivityEvent"("action", "createdAt");
CREATE INDEX "UserActivityEvent_createdAt_idx" ON "UserActivityEvent"("createdAt");
CREATE INDEX "SystemErrorLog_createdAt_idx" ON "SystemErrorLog"("createdAt");
CREATE INDEX "SystemErrorLog_userId_createdAt_idx" ON "SystemErrorLog"("userId", "createdAt");
CREATE INDEX "SupportIssue_status_createdAt_idx" ON "SupportIssue"("status", "createdAt");
CREATE INDEX "SupportIssue_userId_idx" ON "SupportIssue"("userId");

-- AddForeignKey
ALTER TABLE "UserActivityEvent" ADD CONSTRAINT "UserActivityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SystemErrorLog" ADD CONSTRAINT "SystemErrorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportIssue" ADD CONSTRAINT "SupportIssue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportIssue" ADD CONSTRAINT "SupportIssue_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
