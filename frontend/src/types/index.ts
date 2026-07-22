export type HashtagMode = "auto" | "manual" | "none";

export type LanguageOption = {
  code: string;
  label: string;
};

export type HashtagModeOption = {
  value: HashtagMode;
  label: string;
  description: string;
};

export type PostOptions = {
  languages: LanguageOption[];
  hashtagModes: HashtagModeOption[];
  imageOptional: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  subscription: SubscriptionInfo;
};

export type SubscriptionTier = "FREE" | "MEDIUM" | "PREMIUM";

export type SubscriptionInfo = {
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd: string | null;
  premierMember?: boolean;
  plan: {
    id: SubscriptionTier;
    name: string;
    description: string;
    priceUsd: number;
    priceLabel: string;
    interval: string;
    features: string[];
  };
};

export type PlanDefinition = {
  id: SubscriptionTier;
  name: string;
  description: string;
  priceUsd: number;
  priceLabel: string;
  interval: "month" | "free";
  features: string[];
  limits: {
    maxAccounts: number | null;
    maxPostsPerMonth: number | null;
    maxScheduleDaysAhead: number | null;
    allowedPlatforms: string[] | "all";
    analytics: boolean;
    aiAssist: boolean;
  };
};

export type BillingStatus = {
  subscription: SubscriptionInfo;
  usage: {
    accountsConnected: number;
    postsThisMonth: number;
  };
  billingConfigured: boolean;
};

export type SocialAccount = {
  id: string;
  platform: string;
  accountId: string;
  accountName: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export type PlatformStatus = {
  id: string;
  name: string;
  slug: string;
  description: string;
  implemented: boolean;
  configured: boolean;
  connectMethod: "oauth";
  setupHint?: string;
};

export type AiProviderId = "MINIMAX" | "OPENAI" | "ANTHROPIC" | "CUSTOM";

export type AiCredential = {
  id: string;
  name: string;
  provider: AiProviderId;
  model: string | null;
  baseUrl: string | null;
  isDefault: boolean;
  keyHint: string;
  createdAt: string;
  updatedAt: string;
};

export type AiProviderPreset = {
  id: AiProviderId;
  label: string;
  baseUrl: string;
  model: string;
};

export type MediaItem = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export type PostTarget = {
  id: string;
  socialAccountId: string;
  platform: string;
  accountName: string | null;
  customContent: string | null;
  status: string;
  platformPostId: string | null;
  errorMessage: string | null;
  publishedAt: string | null;
};

export type Post = {
  id: string;
  content: string;
  title: string | null;
  images: string[];
  hashtagMode: HashtagMode;
  hashtags: string[];
  language: string;
  finalContent: string;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  targets: PostTarget[];
};

export type CreatePostPayload = {
  content: string;
  title?: string;
  images: string[];
  hashtagMode: HashtagMode;
  hashtags: string[];
  language: string;
  targets: Array<{
    socialAccountId: string;
    customContent?: string;
    subreddit?: string;
  }>;
  publish?: boolean;
  scheduledFor?: string;
};

export type PreviewPayload = {
  content: string;
  images: string[];
  hashtagMode: HashtagMode;
  hashtags: string[];
  language: string;
};

export type LinkedInPostAnalytics = {
  impressions: number;
  membersReached: number;
  reactions: number;
  comments: number;
  reshares: number;
};

export type PostTargetAnalytics = {
  targetId: string;
  platform: string;
  accountName: string | null;
  platformPostId: string | null;
  status: string;
  analytics: LinkedInPostAnalytics | null;
  error?: string;
};

export type PostAnalytics = {
  postId: string;
  fetchedAt: string;
  targets: PostTargetAnalytics[];
};

export type PostCounts = {
  all: number;
  drafts: number;
  scheduled: number;
  published: number;
  trashed: number;
  failed: number;
};

export type LinkedInAnalyticsSummaryPost = {
  postId: string;
  contentPreview: string;
  publishedAt: string | null;
  impressions: number;
  reactions: number;
  comments: number;
  error?: string;
};

export type LinkedInAnalyticsSummary = {
  postsChecked: number;
  postsWithStats: number;
  totalImpressions: number;
  totalMembersReached: number;
  totalReactions: number;
  totalComments: number;
  totalReshares: number;
  lastFetchedAt: string;
  topPosts: LinkedInAnalyticsSummaryPost[];
  error?: string;
};

export type GoogleAdsDatePreset = "LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS" | "CUSTOM";

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

export type LinkedInAdsDatePreset = GoogleAdsDatePreset;

export type LinkedInAdsMetricTotals = GoogleAdsMetricTotals;

export type LinkedInAdsDailyMetric = GoogleAdsDailyMetric;

export type LinkedInAdsCampaignSummary = GoogleAdsCampaignSummary;

export type LinkedInAdsAccountPublic = {
  id: string;
  adAccountId: string;
  adAccountName: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
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
  error?: string;
};

export type LinkedInAdsStatus = {
  configured: boolean;
  connected: boolean;
  redirectUri: string | null;
  connectHint?: string;
};

export type MetaAdsDatePreset = GoogleAdsDatePreset;

export type MetaAdsMetricTotals = GoogleAdsMetricTotals;

export type MetaAdsDailyMetric = GoogleAdsDailyMetric;

export type MetaAdsCampaignSummary = GoogleAdsCampaignSummary;

export type MetaAdsAccountPublic = {
  id: string;
  adAccountId: string;
  adAccountName: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
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
  error?: string;
};

export type MetaAdsStatus = {
  configured: boolean;
  connected: boolean;
  needsAdAccountId: boolean;
  redirectUri: string | null;
  connectHint: string;
};

export type CalendarPostItem = {
  id: string;
  contentPreview: string;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  platforms: string[];
  imageCount: number;
  createdAt: string;
};

export type DashboardData = {
  generatedAt: string;
  accounts: {
    total: number;
    byPlatform: Record<string, number>;
    connected: Array<{
      id: string;
      platform: string;
      accountName: string | null;
    }>;
  };
  posts: PostCounts & { scheduledNext7Days: number };
  upcoming: Post[];
  recent: Post[];
  linkedInAnalytics: LinkedInAnalyticsSummary | null;
  googleAdsAnalytics: GoogleAdsAnalyticsSummary | null;
  linkedInAdsAnalytics: LinkedInAdsAnalyticsSummary | null;
  metaAdsAnalytics: MetaAdsAnalyticsSummary | null;
};
