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

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type OrganizationSummary = {
  id: string;
  name: string;
  tier: SubscriptionTier;
  status: string;
  seatLimit: number;
  seatUsed: number;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  role: UserRole;
  organization: OrganizationSummary | null;
  subscription: SubscriptionInfo;
};

export type SubscriptionTier = "FREE" | "MEDIUM" | "PREMIUM";

export type SubscriptionInfo = {
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd: string | null;
  premierMember?: boolean;
  source?: "individual" | "organization" | "premier";
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
  organization: OrganizationSummary | null;
};

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string | null;
  organization: {
    id: string;
    name: string;
    tier: SubscriptionTier;
    status: string;
  } | null;
  subscription: SubscriptionInfo;
  individualTier: SubscriptionTier;
  individualStatus: string;
  createdAt: string;
};

export type AdminOrganization = {
  id: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: string;
  seatLimit: number;
  seatUsed: number;
  pendingInvites: number;
  createdAt: string;
};

export type SupportIssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type OpsOverview = {
  usersTotal: number;
  admins: number;
  superAdmins: number;
  paidUsers: number;
  estimatedMrr: number;
  postsToday: number;
  openIssues: number;
  errors24h: number;
  tierDistribution: { FREE: number; MEDIUM: number; PREMIUM: number };
};

export type OpsUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isSuspended: boolean;
  organizationId: string | null;
  organization: {
    id: string;
    name: string;
    tier: SubscriptionTier;
    status: string;
  } | null;
  subscription: SubscriptionInfo;
  individualTier: SubscriptionTier;
  individualStatus: string;
  estimatedMrr: number;
  postsTotal: number;
  postsToday: number;
  lastActiveAt: string | null;
  connectedAccounts: Array<{
    id: string;
    platform: string;
    accountName: string | null;
    accountId: string;
    isActive: boolean;
  }>;
  createdAt: string;
};

export type OpsSubscriptions = {
  individualByTier: Record<string, number>;
  individualByStatus: Record<string, number>;
  effectiveByTier: Record<string, number>;
  organizations: Array<{
    id: string;
    name: string;
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: string;
    seatLimit: number;
    seatUsed: number;
    createdAt: string;
  }>;
};

export type OpsEarnings = {
  estimatedMrr: number;
  paidCount: number;
  newPaid24h: number;
  currency: string;
  note: string;
  paidAccounts: Array<{
    id: string;
    email: string;
    name: string | null;
    tier: SubscriptionTier;
    source: string;
    mrr: number;
    updatedAt: string;
  }>;
};

export type OpsUsage = {
  from: string;
  to: string;
  dailyCounts: Record<string, number>;
  hourlyBuckets: number[];
  perUser: Array<{ userId: string; email: string; name: string | null; count: number }>;
  events: Array<{
    id: string;
    userId: string;
    email: string;
    name: string | null;
    action: string;
    path: string | null;
    createdAt: string;
  }>;
};

export type OpsPostRow = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  status: string;
  contentPreview: string;
  language: string;
  platforms: string[];
  createdAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
};

export type OpsErrorRow = {
  id: string;
  level: string;
  message: string;
  stack: string | null;
  path: string | null;
  userId: string | null;
  userEmail: string | null;
  meta: unknown;
  createdAt: string;
};

export type OpsIssueRow = {
  id: string;
  title: string;
  body: string;
  status: SupportIssueStatus;
  priority: string;
  source: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  createdById: string | null;
  createdByEmail: string | null;
  createdAt: string;
  updatedAt: string;
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
