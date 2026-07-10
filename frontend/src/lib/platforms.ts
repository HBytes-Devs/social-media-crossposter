export const PLATFORM_ORDER = [
  "LINKEDIN",
  "INSTAGRAM",
  "FACEBOOK",
  "TWITTER",
  "REDDIT",
] as const;

export type PlatformId = (typeof PLATFORM_ORDER)[number];

export const PLATFORM_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  LINKEDIN: { label: "LinkedIn", color: "#0A66C2", icon: "in" },
  INSTAGRAM: { label: "Instagram", color: "#E4405F", icon: "IG" },
  FACEBOOK: { label: "Facebook", color: "#1877F2", icon: "f" },
  TWITTER: { label: "Twitter / X", color: "#1d9bf0", icon: "𝕏" },
  REDDIT: { label: "Reddit", color: "#FF4500", icon: "r/" },
};

export const CROSS_PLATFORM_KEY = "CROSS_PLATFORM";
export const UNASSIGNED_KEY = "UNASSIGNED";

export function platformLabel(platform: string): string {
  return PLATFORM_META[platform]?.label ?? platform;
}

export function getPostPlatforms(post: { targets: { platform: string }[] }): string[] {
  const platforms = [...new Set(post.targets.map((t) => t.platform))];
  return PLATFORM_ORDER.filter((p) => platforms.includes(p)).concat(
    platforms.filter((p) => !PLATFORM_ORDER.includes(p as PlatformId)),
  );
}

export function getPostGroupKey(post: { targets: { platform: string }[] }): string {
  const platforms = getPostPlatforms(post);
  if (platforms.length === 0) return UNASSIGNED_KEY;
  if (platforms.length === 1) return platforms[0]!;
  return CROSS_PLATFORM_KEY;
}

export type PlatformGroup<T> = {
  key: string;
  label: string;
  color?: string;
  icon?: string;
  posts: T[];
};

export function groupPostsByPlatform<T extends { targets: { platform: string }[] }>(
  posts: T[],
): PlatformGroup<T>[] {
  const buckets = new Map<string, T[]>();

  for (const post of posts) {
    const key = getPostGroupKey(post);
    const list = buckets.get(key) ?? [];
    list.push(post);
    buckets.set(key, list);
  }

  const groups: PlatformGroup<T>[] = [];

  for (const platform of PLATFORM_ORDER) {
    const items = buckets.get(platform);
    if (items?.length) {
      const meta = PLATFORM_META[platform];
      groups.push({
        key: platform,
        label: meta.label,
        color: meta.color,
        icon: meta.icon,
        posts: items,
      });
    }
  }

  const cross = buckets.get(CROSS_PLATFORM_KEY);
  if (cross?.length) {
    groups.push({
      key: CROSS_PLATFORM_KEY,
      label: "Cross-platform",
      color: "#64748b",
      icon: "⊕",
      posts: cross,
    });
  }

  const unassigned = buckets.get(UNASSIGNED_KEY);
  if (unassigned?.length) {
    groups.push({
      key: UNASSIGNED_KEY,
      label: "No platform",
      color: "#475569",
      icon: "—",
      posts: unassigned,
    });
  }

  return groups;
}

export function countPostsByPlatform<T extends { targets: { platform: string }[] }>(
  posts: T[],
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const post of posts) {
    const key = getPostGroupKey(post);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

export function postsPath(
  tab: "all" | "published" | "drafts" | "scheduled" | "trashed" = "all",
  platform?: string,
): string {
  const base = tab === "all" ? "/posts" : `/posts/${tab}`;
  if (!platform) return base;
  return `${base}?platform=${platform}`;
}
