const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (data as { error?: string; message?: string }).error ??
      (data as { message?: string }).message ??
      `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export const api = {
  async getAuthConfig() {
    const res = await request<{
      success: boolean;
      data: { recaptchaEnabled: boolean; emailConfigured: boolean };
    }>("/auth/config");
    return res.data;
  },

  async register(email: string, password: string, name?: string) {
    return request<{
      success: boolean;
      data: { user: import("../types").AuthUser; token: string };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  async login(email: string, password: string, recaptchaToken?: string) {
    return request<{
      success: boolean;
      data: { user: import("../types").AuthUser; token: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, recaptchaToken }),
    });
  },

  async forgotPassword(email: string, recaptchaToken?: string) {
    return request<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, recaptchaToken }),
    });
  },

  async resetPassword(email: string, code: string, password: string) {
    return request<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    });
  },

  async me(token: string) {
    return request<{ success: boolean; data: { user: import("../types").AuthUser } }>(
      "/auth/me",
      {},
      token,
    );
  },

  async updateProfile(token: string, name: string) {
    return request<{
      success: boolean;
      message: string;
      data: { user: import("../types").AuthUser };
    }>(
      "/auth/me",
      { method: "PATCH", body: JSON.stringify({ name }) },
      token,
    );
  },

  async getPostOptions(token: string) {
    return request<{ success: boolean; data: import("../types").PostOptions }>(
      "/posts/options",
      {},
      token,
    );
  },

  async previewPost(token: string, payload: import("../types").PreviewPayload) {
    return request<{
      success: boolean;
      data: { finalContent: string; hashtags: string[] };
    }>(
      "/posts/preview",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    );
  },

  async createPost(token: string, payload: import("../types").CreatePostPayload) {
    return request<{ success: boolean; message?: string; data: { post: import("../types").Post } }>(
      "/posts",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    );
  },

  async getPostCounts(token: string) {
    return request<{ success: boolean; data: import("../types").PostCounts }>(
      "/posts/counts",
      {},
      token,
    ).then((res) => res.data);
  },

  async getCalendarPosts(token: string, from: string, to: string) {
    const search = new URLSearchParams({ from, to });
    return request<{
      success: boolean;
      data: {
        from: string;
        to: string;
        posts: import("../types").CalendarPostItem[];
      };
    }>(`/posts/calendar?${search}`, {}, token).then((res) => res.data);
  },

  async schedulePost(token: string, postId: string, scheduledFor: string) {
    return request<{ success: boolean; data: { post: import("../types").Post } }>(
      `/posts/${postId}/schedule`,
      { method: "POST", body: JSON.stringify({ scheduledFor }) },
      token,
    ).then((res) => res.data);
  },

  async cancelSchedule(token: string, postId: string) {
    return request<{ success: boolean; data: { post: import("../types").Post } }>(
      `/posts/${postId}/cancel-schedule`,
      { method: "POST" },
      token,
    ).then((res) => res.data);
  },

  async publishPost(token: string, postId: string) {
    return request<{ success: boolean; data: { post: import("../types").Post } }>(
      `/posts/${postId}/publish`,
      { method: "POST" },
      token,
    ).then((res) => res.data);
  },

  async retryPost(token: string, postId: string) {
    return request<{
      success: boolean;
      message: string;
      data: { post: import("../types").Post };
    }>(`/posts/${postId}/retry`, { method: "POST" }, token).then((res) => res.data);
  },

  async getDashboard(token: string, options?: { analytics?: boolean }) {
    const query = options?.analytics ? "?analytics=true" : "";
    return request<{ success: boolean; data: import("../types").DashboardData }>(
      `/dashboard${query}`,
      {},
      token,
    ).then((res) => res.data);
  },

  async listPosts(
    token: string,
    params?: {
      tab?: string;
      status?: string;
      platform?: string;
      language?: string;
    },
  ) {
    const search = new URLSearchParams();
    if (params?.tab) search.set("tab", params.tab);
    if (params?.status) search.set("status", params.status);
    if (params?.platform) search.set("platform", params.platform);
    if (params?.language) search.set("language", params.language);
    const query = search.toString() ? `?${search.toString()}` : "";

    return request<{ success: boolean; data: { posts: import("../types").Post[] } }>(
      `/posts${query}`,
      {},
      token,
    );
  },

  async deletePost(token: string, postId: string, permanent = false) {
    const query = permanent ? "?permanent=true" : "";
    return request<{ success: boolean; message: string }>(
      `/posts/${postId}${query}`,
      { method: "DELETE" },
      token,
    );
  },

  async restorePost(token: string, postId: string) {
    return request<{ success: boolean; message: string; data: { post: import("../types").Post } }>(
      `/posts/${postId}/restore`,
      { method: "POST" },
      token,
    );
  },

  async getPostAnalytics(token: string, postId: string) {
    return request<{ success: boolean; data: import("../types").PostAnalytics }>(
      `/posts/${postId}/analytics`,
      {},
      token,
    ).then((res) => res.data);
  },

  async listAccounts(token: string) {
    return request<{ success: boolean; data: { accounts: import("../types").SocialAccount[] } }>(
      "/accounts",
      {},
      token,
    );
  },

  async listPlatforms(token: string) {
    return request<{
      success: boolean;
      data: { platforms: import("../types").PlatformStatus[] };
    }>("/accounts/platforms", {}, token);
  },

  async getConnectUrl(token: string, platform: string) {
    return request<{
      success: boolean;
      data: { authUrl: string; browserUrl?: string };
    }>(`/accounts/${platform}/connect-url`, {}, token);
  },

  async disconnectAccount(token: string, accountId: string) {
    return request<{ success: boolean }>(
      `/accounts/${accountId}`,
      { method: "DELETE" },
      token,
    );
  },

  async uploadImages(token: string, files: File[]) {
    const form = new FormData();
    for (const file of files) {
      form.append("images", file);
    }

    return request<{ success: boolean; data: { media: import("../types").MediaItem[] } }>(
      "/media/upload",
      { method: "POST", body: form },
      token,
    );
  },

  async listMedia(token: string) {
    return request<{ success: boolean; data: { media: import("../types").MediaItem[] } }>(
      "/media",
      {},
      token,
    );
  },

  async getAiStatus(token: string) {
    return request<{
      success: boolean;
      data: {
        configured: boolean;
        imageGeneration: boolean;
        imageProvider: "minimax" | "openai" | null;
        imageKeyName: string | null;
        provider: string;
        model: string;
        keyName: string | null;
        source: "user" | "server" | "none";
        features: string[];
      };
    }>("/ai/status", {}, token).then((res) => res.data);
  },

  async listAiProviders(token: string) {
    return request<{
      success: boolean;
      data: { providers: import("../types").AiProviderPreset[] };
    }>("/settings/ai-providers", {}, token).then((res) => res.data.providers);
  },

  async listAiKeys(token: string) {
    return request<{
      success: boolean;
      data: { credentials: import("../types").AiCredential[] };
    }>("/settings/ai-keys", {}, token).then((res) => res.data.credentials);
  },

  async createAiKey(
    token: string,
    payload: {
      name: string;
      provider: import("../types").AiProviderId;
      apiKey: string;
      baseUrl?: string | null;
      model?: string | null;
      isDefault?: boolean;
    },
  ) {
    return request<{
      success: boolean;
      data: { credential: import("../types").AiCredential };
    }>("/settings/ai-keys", { method: "POST", body: JSON.stringify(payload) }, token).then(
      (res) => res.data.credential,
    );
  },

  async updateAiKey(
    token: string,
    id: string,
    payload: {
      name?: string;
      apiKey?: string;
      baseUrl?: string | null;
      model?: string | null;
      isDefault?: boolean;
    },
  ) {
    return request<{
      success: boolean;
      data: { credential: import("../types").AiCredential };
    }>(`/settings/ai-keys/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token).then(
      (res) => res.data.credential,
    );
  },

  async deleteAiKey(token: string, id: string) {
    return request<{ success: boolean; message: string }>(
      `/settings/ai-keys/${id}`,
      { method: "DELETE" },
      token,
    );
  },

  async improvePost(
    token: string,
    payload: {
      content: string;
      language?: string;
      tone?: "professional" | "casual" | "friendly";
      platform?: string;
    },
  ) {
    return request<{ success: boolean; data: { content: string } }>(
      "/ai/improve",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ).then((res) => res.data);
  },

  async generateSmartHashtags(
    token: string,
    payload: { content: string; language?: string; max?: number },
  ) {
    return request<{ success: boolean; data: { hashtags: string[] } }>(
      "/ai/hashtags",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ).then((res) => res.data);
  },

  async localizeWithAi(
    token: string,
    payload: { content: string; language: string },
  ) {
    return request<{ success: boolean; data: { content: string } }>(
      "/ai/localize",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ).then((res) => res.data);
  },

  async suggestCompletion(
    token: string,
    payload: { content: string; language?: string },
  ) {
    return request<{ success: boolean; data: { suggestion: string } }>(
      "/ai/suggest",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ).then((res) => res.data);
  },

  async correctText(
    token: string,
    payload: { content: string; language?: string },
  ) {
    return request<{ success: boolean; data: { content: string; changed: boolean } }>(
      "/ai/correct",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ).then((res) => res.data);
  },

  async generatePostImage(
    token: string,
    payload: { content: string; language?: string; platform?: string },
  ) {
    return request<{
      success: boolean;
      data: { media: import("../types").MediaItem; prompt: string };
    }>("/ai/generate-image", { method: "POST", body: JSON.stringify(payload) }, token).then(
      (res) => res.data,
    );
  },

  async getBillingPlans() {
    return request<{
      success: boolean;
      data: { plans: import("../types").PlanDefinition[]; billingConfigured: boolean };
    }>("/billing/plans").then((res) => res.data);
  },

  async getBillingStatus(token: string) {
    return request<{ success: boolean; data: import("../types").BillingStatus }>(
      "/billing/status",
      {},
      token,
    ).then((res) => res.data);
  },

  async createCheckoutSession(token: string, tier: "MEDIUM" | "PREMIUM") {
    return request<{ success: boolean; data: { url: string } }>(
      "/billing/checkout",
      { method: "POST", body: JSON.stringify({ tier }) },
      token,
    ).then((res) => res.data);
  },

  async createBillingPortalSession(token: string) {
    return request<{ success: boolean; data: { url: string } }>(
      "/billing/portal",
      { method: "POST" },
      token,
    ).then((res) => res.data);
  },
};

export { ApiError };
