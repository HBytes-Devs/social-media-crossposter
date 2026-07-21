-- CreateTable
CREATE TABLE "GoogleAdsAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT,
    "loginCustomerId" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAdsAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAdsAccountMetric" (
    "id" TEXT NOT NULL,
    "googleAdsAccountId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "costMicros" BIGINT NOT NULL DEFAULT 0,
    "conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleAdsAccountMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAdsCampaignMetric" (
    "id" TEXT NOT NULL,
    "googleAdsAccountId" TEXT NOT NULL,
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

    CONSTRAINT "GoogleAdsCampaignMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleAdsAccount_userId_idx" ON "GoogleAdsAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAdsAccount_userId_customerId_key" ON "GoogleAdsAccount"("userId", "customerId");

-- CreateIndex
CREATE INDEX "GoogleAdsAccountMetric_googleAdsAccountId_date_idx" ON "GoogleAdsAccountMetric"("googleAdsAccountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAdsAccountMetric_googleAdsAccountId_date_key" ON "GoogleAdsAccountMetric"("googleAdsAccountId", "date");

-- CreateIndex
CREATE INDEX "GoogleAdsCampaignMetric_googleAdsAccountId_date_idx" ON "GoogleAdsCampaignMetric"("googleAdsAccountId", "date");

-- CreateIndex
CREATE INDEX "GoogleAdsCampaignMetric_googleAdsAccountId_campaignId_idx" ON "GoogleAdsCampaignMetric"("googleAdsAccountId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAdsCampaignMetric_googleAdsAccountId_campaignId_date_key" ON "GoogleAdsCampaignMetric"("googleAdsAccountId", "campaignId", "date");

-- AddForeignKey
ALTER TABLE "GoogleAdsAccount" ADD CONSTRAINT "GoogleAdsAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleAdsAccountMetric" ADD CONSTRAINT "GoogleAdsAccountMetric_googleAdsAccountId_fkey" FOREIGN KEY ("googleAdsAccountId") REFERENCES "GoogleAdsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleAdsCampaignMetric" ADD CONSTRAINT "GoogleAdsCampaignMetric_googleAdsAccountId_fkey" FOREIGN KEY ("googleAdsAccountId") REFERENCES "GoogleAdsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
