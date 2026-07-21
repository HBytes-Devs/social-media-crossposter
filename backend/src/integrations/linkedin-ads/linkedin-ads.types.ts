export const LINKEDIN_ADS_API_VERSION = "202601";

export const LINKEDIN_ADS_SCOPES = ["r_ads", "r_ads_reporting"] as const;

export const LINKEDIN_ADS_DATE_PRESETS = [
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "LAST_90_DAYS",
  "CUSTOM",
] as const;

export type LinkedInAdsDatePreset = (typeof LINKEDIN_ADS_DATE_PRESETS)[number];

export type LinkedInAdsAccountPublic = {
  id: string;
  adAccountId: string;
  adAccountName: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
};

export type LinkedInAdsMetricTotals = {
  impressions: number;
  clicks: number;
  costMicros: string;
  cost: number;
  conversions: number;
  ctr: number;
};

export type LinkedInAdsDailyMetric = LinkedInAdsMetricTotals & {
  date: string;
};

export type LinkedInAdsCampaignSummary = LinkedInAdsMetricTotals & {
  campaignId: string;
  campaignName: string;
};

export type LinkedInAdsAnalyticsSummary = {
  account: LinkedInAdsAccountPublic | null;
  datePreset: LinkedInAdsDatePreset;
  from: string;
  to: string;
  totals: LinkedInAdsMetricTotals;
  daily: LinkedInAdsDailyMetric[];
  topCampaigns: LinkedInAdsCampaignSummary[];
  lastSyncedAt: string | null;
};

export type LinkedInAdsStatus = {
  configured: boolean;
  connected: boolean;
  redirectUri: string | null;
  connectHint: string;
};
