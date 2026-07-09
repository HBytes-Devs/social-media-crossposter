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
};
