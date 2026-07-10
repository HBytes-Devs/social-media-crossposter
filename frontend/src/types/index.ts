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
  posts: PostCounts;
  upcoming: Post[];
  recent: Post[];
};
