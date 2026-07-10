export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type JwtPayload = {
  userId: string;
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

export type PostTargetPublic = {
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

export type PostPublic = {
  id: string;
  content: string;
  title: string | null;
  images: string[];
  hashtagMode: "manual" | "auto" | "none";
  hashtags: string[];
  language: string;
  finalContent: string;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  targets: PostTargetPublic[];
};

export type HealthStatus = {
  status: "ok" | "degraded";
  timestamp: string;
  uptime: number;
  environment: string;
  database: "connected" | "disconnected";
  version: string;
  channel: string;
  fullVersion: string;
  apiVersion: string;
  product: string;
};

export type LinkedInPostAnalytics = {
  impressions: number;
  membersReached: number;
  reactions: number;
  comments: number;
  reshares: number;
};

export type PostTargetAnalyticsPublic = {
  targetId: string;
  platform: string;
  accountName: string | null;
  platformPostId: string | null;
  status: string;
  analytics: LinkedInPostAnalytics | null;
  error?: string;
};

export type PostAnalyticsPublic = {
  postId: string;
  fetchedAt: string;
  targets: PostTargetAnalyticsPublic[];
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

export type PostCounts = {
  all: number;
  drafts: number;
  scheduled: number;
  published: number;
  trashed: number;
  failed: number;
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
  upcoming: PostPublic[];
  recent: PostPublic[];
  linkedInAnalytics: LinkedInAnalyticsSummary | null;
};
