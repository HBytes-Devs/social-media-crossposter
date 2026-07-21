-- CreateTable
CREATE TABLE "LinkedInAdsAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adAccountId" TEXT NOT NULL,
    "adAccountName" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInAdsAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInAdsAccountMetric" (
    "id" TEXT NOT NULL,
    "linkedInAdsAccountId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "costMicros" BIGINT NOT NULL DEFAULT 0,
    "conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInAdsAccountMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInAdsCampaignMetric" (
    "id" TEXT NOT NULL,
    "linkedInAdsAccountId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "campaignName" TEXT,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "costMicros" BIGINT NOT NULL DEFAULT 0,
    "conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInAdsCampaignMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkedInAdsAccount_userId_idx" ON "LinkedInAdsAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInAdsAccount_userId_adAccountId_key" ON "LinkedInAdsAccount"("userId", "adAccountId");

-- CreateIndex
CREATE INDEX "LinkedInAdsAccountMetric_linkedInAdsAccountId_date_idx" ON "LinkedInAdsAccountMetric"("linkedInAdsAccountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInAdsAccountMetric_linkedInAdsAccountId_date_key" ON "LinkedInAdsAccountMetric"("linkedInAdsAccountId", "date");

-- CreateIndex
CREATE INDEX "LinkedInAdsCampaignMetric_linkedInAdsAccountId_date_idx" ON "LinkedInAdsCampaignMetric"("linkedInAdsAccountId", "date");

-- CreateIndex
CREATE INDEX "LinkedInAdsCampaignMetric_linkedInAdsAccountId_campaignId_idx" ON "LinkedInAdsCampaignMetric"("linkedInAdsAccountId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInAdsCampaignMetric_linkedInAdsAccountId_campaignId_date_key" ON "LinkedInAdsCampaignMetric"("linkedInAdsAccountId", "campaignId", "date");

-- AddForeignKey
ALTER TABLE "LinkedInAdsAccount" ADD CONSTRAINT "LinkedInAdsAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedInAdsAccountMetric" ADD CONSTRAINT "LinkedInAdsAccountMetric_linkedInAdsAccountId_fkey" FOREIGN KEY ("linkedInAdsAccountId") REFERENCES "LinkedInAdsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedInAdsCampaignMetric" ADD CONSTRAINT "LinkedInAdsCampaignMetric_linkedInAdsAccountId_fkey" FOREIGN KEY ("linkedInAdsAccountId") REFERENCES "LinkedInAdsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
