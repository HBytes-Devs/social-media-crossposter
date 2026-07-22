export const META_ADS_PENDING_ACCOUNT_ID = "__pending__" as const;

export const META_ADS_SCOPES = ["ads_read", "business_management", "public_profile"] as const;

export const META_ADS_DATE_PRESETS = [
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "LAST_90_DAYS",
  "CUSTOM",
] as const;

export type MetaAdsDatePreset = (typeof META_ADS_DATE_PRESETS)[number];

export type MetaAdsAccountPublic = {
  id: string;
  adAccountId: string;
  adAccountName: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
};

export type MetaAdsMetricTotals = {
  impressions: number;
  clicks: number;
  costMicros: string;
  cost: number;
  conversions: number;
  ctr: number;
};

export type MetaAdsDailyMetric = MetaAdsMetricTotals & {
  date: string;
};

export type MetaAdsCampaignSummary = MetaAdsMetricTotals & {
  campaignId: string;
  campaignName: string;
};

export type MetaAdsAnalyticsSummary = {
  account: MetaAdsAccountPublic | null;
  datePreset: MetaAdsDatePreset;
  from: string;
  to: string;
  totals: MetaAdsMetricTotals;
  daily: MetaAdsDailyMetric[];
  topCampaigns: MetaAdsCampaignSummary[];
  lastSyncedAt: string | null;
};

export type MetaAdsStatus = {
  configured: boolean;
  connected: boolean;
  needsAdAccountId: boolean;
  redirectUri: string | null;
  connectHint: string;
};
