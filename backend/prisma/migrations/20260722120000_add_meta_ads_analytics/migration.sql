-- CreateTable
CREATE TABLE "MetaAdsAccount" (
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

    CONSTRAINT "MetaAdsAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaAdsAccountMetric" (
    "id" TEXT NOT NULL,
    "metaAdsAccountId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "costMicros" BIGINT NOT NULL DEFAULT 0,
    "conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaAdsAccountMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaAdsCampaignMetric" (
    "id" TEXT NOT NULL,
    "metaAdsAccountId" TEXT NOT NULL,
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

    CONSTRAINT "MetaAdsCampaignMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaAdsAccount_userId_idx" ON "MetaAdsAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MetaAdsAccount_userId_adAccountId_key" ON "MetaAdsAccount"("userId", "adAccountId");

-- CreateIndex
CREATE INDEX "MetaAdsAccountMetric_metaAdsAccountId_date_idx" ON "MetaAdsAccountMetric"("metaAdsAccountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MetaAdsAccountMetric_metaAdsAccountId_date_key" ON "MetaAdsAccountMetric"("metaAdsAccountId", "date");

-- CreateIndex
CREATE INDEX "MetaAdsCampaignMetric_metaAdsAccountId_date_idx" ON "MetaAdsCampaignMetric"("metaAdsAccountId", "date");

-- CreateIndex
CREATE INDEX "MetaAdsCampaignMetric_metaAdsAccountId_campaignId_idx" ON "MetaAdsCampaignMetric"("metaAdsAccountId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "MetaAdsCampaignMetric_metaAdsAccountId_campaignId_date_key" ON "MetaAdsCampaignMetric"("metaAdsAccountId", "campaignId", "date");

-- AddForeignKey
ALTER TABLE "MetaAdsAccount" ADD CONSTRAINT "MetaAdsAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAdsAccountMetric" ADD CONSTRAINT "MetaAdsAccountMetric_metaAdsAccountId_fkey" FOREIGN KEY ("metaAdsAccountId") REFERENCES "MetaAdsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaAdsCampaignMetric" ADD CONSTRAINT "MetaAdsCampaignMetric_metaAdsAccountId_fkey" FOREIGN KEY ("metaAdsAccountId") REFERENCES "MetaAdsAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
