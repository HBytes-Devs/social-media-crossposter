import { env } from "../../config/env.js";

const LINKEDIN_API_BASE = "https://api.linkedin.com/rest";
const LINKEDIN_VERSION = env.LINKEDIN_API_VERSION;

const METRIC_TYPES = [
  "IMPRESSION",
  "MEMBERS_REACHED",
  "REACTION",
  "COMMENT",
  "RESHARE",
] as const;

type MetricType = (typeof METRIC_TYPES)[number];

export type LinkedInPostAnalytics = {
  impressions: number;
  membersReached: number;
  reactions: number;
  comments: number;
  reshares: number;
};

type AnalyticsElement = {
  count?: number;
  metricType?: string | Record<string, string>;
};

type AnalyticsResponse = {
  elements?: AnalyticsElement[];
};

function normalizeUrn(platformPostId: string): string {
  if (platformPostId.startsWith("urn:li:")) {
    return platformPostId;
  }

  return `urn:li:share:${platformPostId}`;
}

function buildEntityParam(urn: string): string {
  const encoded = encodeURIComponent(urn);

  if (urn.includes(":ugcPost:")) {
    return `(ugc:${encoded})`;
  }

  return `(share:${encoded})`;
}

function extractCount(elements: AnalyticsElement[] | undefined): number {
  if (!elements?.length) {
    return 0;
  }

  return elements.reduce((sum, element) => sum + (element.count ?? 0), 0);
}

async function fetchMetric(
  accessToken: string,
  entityParam: string,
  queryType: MetricType,
): Promise<number> {
  const url = new URL(`${LINKEDIN_API_BASE}/memberCreatorPostAnalytics`);
  url.searchParams.set("q", "entity");
  url.searchParams.set("entity", entityParam);
  url.searchParams.set("queryType", queryType);
  url.searchParams.set("aggregation", "TOTAL");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": LINKEDIN_VERSION,
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 403 || errorText.includes("ACCESS_DENIED")) {
      throw new Error(
        "LinkedIn analytics access denied. Apply for Community Management API and add r_member_postAnalytics scope, then reconnect LinkedIn.",
      );
    }

    throw new Error(`LinkedIn analytics error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as AnalyticsResponse;
  return extractCount(data.elements);
}

export async function fetchLinkedInPostAnalytics(
  accessToken: string,
  platformPostId: string,
): Promise<LinkedInPostAnalytics> {
  const urn = normalizeUrn(platformPostId);
  const entityParam = buildEntityParam(urn);

  const results = await Promise.all(
    METRIC_TYPES.map(async (metric) => ({
      metric,
      count: await fetchMetric(accessToken, entityParam, metric),
    })),
  );

  const byMetric = Object.fromEntries(results.map((r) => [r.metric, r.count])) as Record<
    MetricType,
    number
  >;

  return {
    impressions: byMetric.IMPRESSION ?? 0,
    membersReached: byMetric.MEMBERS_REACHED ?? 0,
    reactions: byMetric.REACTION ?? 0,
    comments: byMetric.COMMENT ?? 0,
    reshares: byMetric.RESHARE ?? 0,
  };
}
