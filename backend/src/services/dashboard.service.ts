import { prisma } from "../config/database.js";
import { getPostCounts, toPostPublic } from "./posts.service.js";

export async function getDashboard(userId: string) {
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const postInclude = {
    targets: { include: { socialAccount: { select: { accountName: true } } } },
  } as const;

  const [counts, accounts, upcomingRaw, recentRaw] = await Promise.all([
    getPostCounts(userId),
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
    posts: counts,
    upcoming: upcomingRaw.map(toPostPublic),
    recent: recentRaw.map(toPostPublic),
  };
}
