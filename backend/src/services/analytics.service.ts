import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error.middleware.js";
import { fetchLinkedInPostAnalytics } from "../platforms/linkedin/linkedin.analytics.js";
import * as accountsService from "./accounts.service.js";
import type {
  LinkedInAnalyticsSummary,
  LinkedInAnalyticsSummaryPost,
  PostAnalyticsPublic,
  PostTargetAnalyticsPublic,
} from "../types/index.js";

export async function getPostAnalytics(
  userId: string,
  postId: string,
): Promise<PostAnalyticsPublic> {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
    include: {
      targets: {
        include: {
          socialAccount: { select: { accountName: true } },
        },
      },
    },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  const targets: PostTargetAnalyticsPublic[] = [];

  for (const target of post.targets) {
    if (target.platform !== "LINKEDIN") {
      targets.push({
        targetId: target.id,
        platform: target.platform,
        accountName: target.socialAccount.accountName,
        platformPostId: target.platformPostId,
        status: target.status,
        analytics: null,
        error: "Analytics not supported for this platform yet",
      });
      continue;
    }

    if (target.status !== "SUCCESS" || !target.platformPostId) {
      targets.push({
        targetId: target.id,
        platform: target.platform,
        accountName: target.socialAccount.accountName,
        platformPostId: target.platformPostId,
        status: target.status,
        analytics: null,
        error: "Post was not successfully published to LinkedIn",
      });
      continue;
    }

    try {
      const tokenData = await accountsService.getDecryptedToken(
        target.socialAccountId,
        userId,
      );

      const analytics = await fetchLinkedInPostAnalytics(
        tokenData.accessToken,
        target.platformPostId,
      );

      targets.push({
        targetId: target.id,
        platform: target.platform,
        accountName: target.socialAccount.accountName,
        platformPostId: target.platformPostId,
        status: target.status,
        analytics,
      });
    } catch (error) {
      targets.push({
        targetId: target.id,
        platform: target.platform,
        accountName: target.socialAccount.accountName,
        platformPostId: target.platformPostId,
        status: target.status,
        analytics: null,
        error: error instanceof Error ? error.message : "Failed to fetch analytics",
      });
    }
  }

  return {
    postId,
    fetchedAt: new Date().toISOString(),
    targets,
  };
}

const SUMMARY_POST_LIMIT = 5;

export async function getLinkedInAnalyticsSummary(
  userId: string,
  limit = SUMMARY_POST_LIMIT,
): Promise<LinkedInAnalyticsSummary> {
  const fetchedAt = new Date().toISOString();

  const linkedInAccount = await prisma.socialAccount.findFirst({
    where: { userId, platform: "LINKEDIN", isActive: true },
    select: { id: true },
  });

  if (!linkedInAccount) {
    return {
      postsChecked: 0,
      postsWithStats: 0,
      totalImpressions: 0,
      totalMembersReached: 0,
      totalReactions: 0,
      totalComments: 0,
      totalReshares: 0,
      lastFetchedAt: fetchedAt,
      topPosts: [],
      error: "Connect LinkedIn on Accounts page to see analytics",
    };
  }

  const targets = await prisma.postTarget.findMany({
    where: {
      platform: "LINKEDIN",
      status: "SUCCESS",
      platformPostId: { not: null },
      post: {
        userId,
        deletedAt: null,
        status: { in: ["PUBLISHED", "PARTIAL"] },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      post: { select: { id: true, content: true, publishedAt: true } },
    },
  });

  if (targets.length === 0) {
    return {
      postsChecked: 0,
      postsWithStats: 0,
      totalImpressions: 0,
      totalMembersReached: 0,
      totalReactions: 0,
      totalComments: 0,
      totalReshares: 0,
      lastFetchedAt: fetchedAt,
      topPosts: [],
      error: "No published LinkedIn posts yet",
    };
  }

  let totalImpressions = 0;
  let totalMembersReached = 0;
  let totalReactions = 0;
  let totalComments = 0;
  let totalReshares = 0;
  let postsWithStats = 0;
  let firstError: string | undefined;
  const topPosts: LinkedInAnalyticsSummaryPost[] = [];

  for (const target of targets) {
    const preview =
      target.post.content.trim().slice(0, 80) || "(image post)";

    try {
      const tokenData = await accountsService.getDecryptedToken(
        target.socialAccountId,
        userId,
      );

      const analytics = await fetchLinkedInPostAnalytics(
        tokenData.accessToken,
        target.platformPostId!,
      );

      postsWithStats += 1;
      totalImpressions += analytics.impressions;
      totalMembersReached += analytics.membersReached;
      totalReactions += analytics.reactions;
      totalComments += analytics.comments;
      totalReshares += analytics.reshares;

      topPosts.push({
        postId: target.post.id,
        contentPreview: preview,
        publishedAt: target.post.publishedAt?.toISOString() ?? null,
        impressions: analytics.impressions,
        reactions: analytics.reactions,
        comments: analytics.comments,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch analytics";
      if (!firstError) firstError = message;

      topPosts.push({
        postId: target.post.id,
        contentPreview: preview,
        publishedAt: target.post.publishedAt?.toISOString() ?? null,
        impressions: 0,
        reactions: 0,
        comments: 0,
        error: message,
      });
    }
  }

  return {
    postsChecked: targets.length,
    postsWithStats,
    totalImpressions,
    totalMembersReached,
    totalReactions,
    totalComments,
    totalReshares,
    lastFetchedAt: fetchedAt,
    topPosts,
    error: postsWithStats === 0 ? firstError : undefined,
  };
}
