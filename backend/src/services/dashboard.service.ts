import { prisma } from "../config/database.js";
import * as analyticsService from "./analytics.service.js";
import * as googleAdsService from "./google-ads.service.js";
import * as linkedInAdsService from "./linkedin-ads.service.js";
import { getPostCounts, toPostPublic } from "./posts.service.js";

type DashboardOptions = {
  includeAnalytics?: boolean;
};

export async function getDashboard(userId: string, options: DashboardOptions = {}) {
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const postInclude = {
    targets: { include: { socialAccount: { select: { accountName: true } } } },
  } as const;

  const [
    counts,
    scheduledNext7Days,
    accounts,
    upcomingRaw,
    recentRaw,
    linkedInAnalytics,
    googleAdsAnalytics,
    linkedInAdsAnalytics,
  ] = await Promise.all([
      getPostCounts(userId),
      prisma.post.count({
        where: {
          userId,
          deletedAt: null,
          status: "SCHEDULED",
          scheduledFor: { gte: now, lte: weekAhead },
        },
      }),
      prisma.socialAccount.findMany({
        where: { userId, isActive: true },
        select: { id: true, platform: true, accountName: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.post.findMany({
        where: {
          userId,
          deletedAt: null,
          status: "SCHEDULED",
          scheduledFor: { gte: now, lte: weekAhead },
        },
        orderBy: { scheduledFor: "asc" },
        take: 5,
        include: postInclude,
      }),
      prisma.post.findMany({
        where: {
          userId,
          deletedAt: null,
          status: { in: ["PUBLISHED", "PARTIAL"] },
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
        include: postInclude,
      }),
      options.includeAnalytics
        ? analyticsService.getLinkedInAnalyticsSummary(userId)
        : Promise.resolve(null),
      options.includeAnalytics
        ? googleAdsService.getAnalyticsSummary(userId, { preset: "LAST_30_DAYS" })
        : Promise.resolve(null),
      options.includeAnalytics
        ? linkedInAdsService.getAnalyticsSummary(userId, { preset: "LAST_30_DAYS" })
        : Promise.resolve(null),
    ]);

  const accountsByPlatform = accounts.reduce<Record<string, number>>((acc, account) => {
    acc[account.platform] = (acc[account.platform] ?? 0) + 1;
    return acc;
  }, {});

  return {
    generatedAt: now.toISOString(),
    accounts: {
      total: accounts.length,
      byPlatform: accountsByPlatform,
      connected: accounts.map((a) => ({
        id: a.id,
        platform: a.platform,
        accountName: a.accountName,
      })),
    },
    posts: {
      ...counts,
      scheduledNext7Days,
    },
    upcoming: upcomingRaw.map(toPostPublic),
    recent: recentRaw.map(toPostPublic),
    linkedInAnalytics,
    googleAdsAnalytics,
    linkedInAdsAnalytics,
  };
}
