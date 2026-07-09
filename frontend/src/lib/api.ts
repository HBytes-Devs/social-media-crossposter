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
  async register(email: string, password: string, name?: string) {
    return request<{
      success: boolean;
      data: { user: import("../types").AuthUser; token: string };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  async login(email: string, password: string) {
    return request<{
      success: boolean;
      data: { user: import("../types").AuthUser; token: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async me(token: string) {
    return request<{ success: boolean; data: { user: import("../types").AuthUser } }>(
      "/auth/me",
      {},
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
    return request<{ success: boolean; data: { post: import("../types").Post } }>(
      "/posts",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    );
  },

  async listPosts(token: string, status?: string) {
    const query = status ? `?status=${status}` : "";
    return request<{ success: boolean; data: { posts: import("../types").Post[] } }>(
      `/posts${query}`,
      {},
      token,
    );
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
};

export { ApiError };
