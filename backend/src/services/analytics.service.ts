import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error.middleware.js";
import { fetchLinkedInPostAnalytics } from "../platforms/linkedin/linkedin.analytics.js";
import * as accountsService from "./accounts.service.js";
import type { PostAnalyticsPublic, PostTargetAnalyticsPublic } from "../types/index.js";

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
