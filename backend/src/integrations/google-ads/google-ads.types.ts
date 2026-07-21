/** Current Google Ads REST major version (v18+ sunset → 404 HTML pages). */
export const GOOGLE_ADS_API_VERSION = "v24";
export const GOOGLE_ADS_SCOPE = "https://www.googleapis.com/auth/adwords";

export const GOOGLE_ADS_DATE_PRESETS = [
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "LAST_90_DAYS",
  "CUSTOM",
] as const;

export type GoogleAdsDatePreset = (typeof GOOGLE_ADS_DATE_PRESETS)[number];

export type GoogleAdsMetricTotals = {
  impressions: number;
  clicks: number;
  costMicros: string;
  cost: number;
  conversions: number;
  ctr: number;
};

export type GoogleAdsDailyMetric = GoogleAdsMetricTotals & {
  date: string;
};

export type GoogleAdsCampaignSummary = GoogleAdsMetricTotals & {
  campaignId: string;
  campaignName: string;
};

export type GoogleAdsAccountPublic = {
  id: string;
  customerId: string;
  customerName: string | null;
  loginCustomerId: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
};

export type GoogleAdsAnalyticsSummary = {
  account: GoogleAdsAccountPublic | null;
  datePreset: GoogleAdsDatePreset;
  from: string;
  to: string;
  totals: GoogleAdsMetricTotals;
  daily: GoogleAdsDailyMetric[];
  topCampaigns: GoogleAdsCampaignSummary[];
  lastSyncedAt: string | null;
  error?: string;
};

export type GoogleAdsStatus = {
  configured: boolean;
  connected: boolean;
  developerTokenSet: boolean;
  redirectUri: string | null;
  connectHint?: string;
};
