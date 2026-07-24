import type { HashtagMode, Platform, PostStatus, PublishStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error.middleware.js";
import { getPlatformAdapter } from "../platforms/platform.factory.js";
import type { UnifiedPost } from "../platforms/platform.types.js";
import * as accountsService from "./accounts.service.js";
import {
  buildFinalContent,
  previewPost,
  resolveHashtags,
  SUPPORTED_LANGUAGES,
} from "./hashtags.service.js";
import { localizeContent } from "./translate.service.js";
import { archivePostImages, moveImagesToTrash } from "./s3-archive.service.js";
import type { CreatePostInput, PreviewPostInput, UpdatePostInput } from "../validators/post.validator.js";
import { fromHashtagModeEnum, toHashtagModeEnum } from "../validators/post.validator.js";
import type { PostPublic, PostTargetPublic } from "../types/index.js";
import * as planService from "./plan.service.js";
import { createSupportIssue, recordActivity, recordSystemError } from "./ops-telemetry.service.js";

export type PostListTab = "all" | "published" | "drafts" | "scheduled" | "trashed";

export type PostListFilters = {
  tab?: PostListTab;
  platform?: Platform;
  language?: string;
  status?: PostStatus;
};

const DRAFT_STATUSES: PostStatus[] = ["DRAFT"];
const SCHEDULED_STATUSES: PostStatus[] = ["SCHEDULED"];
const PUBLISHED_TAB_STATUSES: PostStatus[] = ["PUBLISHED", "PARTIAL", "FAILED", "PUBLISHING"];

function buildPostWhere(userId: string, filters: PostListFilters): Prisma.PostWhereInput {
  const tab = filters.tab ?? "all";

  if (tab === "trashed") {
    return {
      userId,
      deletedAt: { not: null },
      ...(filters.language ? { language: filters.language } : {}),
      ...(filters.platform ? { targets: { some: { platform: filters.platform } } } : {}),
    };
  }

  const where: Prisma.PostWhereInput = {
    userId,
    deletedAt: null,
  };

  if (tab === "drafts") {
    where.status = { in: DRAFT_STATUSES };
  } else if (tab === "scheduled") {
    where.status = { in: SCHEDULED_STATUSES };
  } else if (tab === "published") {
    where.status = { in: PUBLISHED_TAB_STATUSES };
  } else if (filters.status) {
    where.status = filters.status;
  }

  if (filters.language) {
    where.language = filters.language;
  }

  if (filters.platform) {
    where.targets = { some: { platform: filters.platform } };
  }

  return where;
}

function assertNotTrashed(post: { deletedAt: Date | null }) {
  if (post.deletedAt) {
    throw new AppError(400, "Post is in trash. Restore it first.");
  }
}

function assertEditable(post: { deletedAt: Date | null; status: PostStatus }) {
  assertNotTrashed(post);
  if (post.status !== "DRAFT" && post.status !== "SCHEDULED") {
    throw new AppError(400, "Only draft or scheduled posts can be edited");
  }
}

const postInclude = {
  targets: { include: { socialAccount: { select: { accountName: true } } } },
} as const;

async function fetchPostPublic(postId: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: postInclude,
  });
  return toPostPublic(post);
}

function toTargetPublic(target: {
  id: string;
  socialAccountId: string;
  platform: Platform;
  customContent: string | null;
  subreddit: string | null;
  status: PublishStatus;
  platformPostId: string | null;
  errorMessage: string | null;
  publishedAt: Date | null;
  socialAccount?: { accountName: string | null };
}): PostTargetPublic {
  return {
    id: target.id,
    socialAccountId: target.socialAccountId,
    platform: target.platform,
    accountName: target.socialAccount?.accountName ?? null,
    customContent: target.customContent,
    status: target.status,
    platformPostId: target.platformPostId,
    errorMessage: target.errorMessage,
    publishedAt: target.publishedAt?.toISOString() ?? null,
  };
}

export function toPostPublic(post: {
  id: string;
  content: string;
  title: string | null;
  images: string[];
  hashtagMode: HashtagMode;
  hashtags: string[];
  language: string;
  status: PostStatus;
  scheduledFor: Date | null;
  publishedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  targets: Array<{
    id: string;
    socialAccountId: string;
    platform: Platform;
    customContent: string | null;
    subreddit: string | null;
    status: PublishStatus;
    platformPostId: string | null;
    errorMessage: string | null;
    publishedAt: Date | null;
    socialAccount: { accountName: string | null };
  }>;
}): PostPublic {
  const preview = previewPost({
    content: post.content,
    hashtagMode: post.hashtagMode,
    hashtags: post.hashtags,
    language: post.language,
  });

  return {
    id: post.id,
    content: post.content,
    title: post.title,
    images: post.images,
    hashtagMode: fromHashtagModeEnum(post.hashtagMode),
    hashtags: post.hashtags,
    language: post.language,
    finalContent: preview.finalContent,
    status: post.status,
    scheduledFor: post.scheduledFor?.toISOString() ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    deletedAt: post.deletedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    targets: post.targets.map(toTargetPublic),
  };
}

async function validateTargets(userId: string, targets: CreatePostInput["targets"]) {
  const accountIds = targets.map((t) => t.socialAccountId);
  const accounts = await prisma.socialAccount.findMany({
    where: { userId, id: { in: accountIds }, isActive: true },
  });

  if (accounts.length !== accountIds.length) {
    throw new AppError(400, "One or more social accounts are invalid or not connected");
  }

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  for (const target of targets) {
    const account = accountMap.get(target.socialAccountId);
    if (account?.platform === "REDDIT" && !target.subreddit?.trim()) {
      throw new AppError(400, "Subreddit is required for Reddit posts (e.g. test)");
    }
  }

  return accounts;
}

export function getPostOptions() {
  return {
    languages: SUPPORTED_LANGUAGES,
    hashtagModes: [
      { value: "auto", label: "Auto hashtags", description: "Hashtags auto-generate from content" },
      { value: "manual", label: "Manual hashtags", description: "Use only your provided hashtags" },
      { value: "none", label: "No hashtags", description: "Post without any hashtags" },
    ],
    imageOptional: true,
  };
}

export async function previewPostContent(userId: string, input: PreviewPostInput) {
  const localizedContent = await localizeContent(input.content, input.language, userId);

  return {
    ...previewPost({
      content: localizedContent,
      hashtagMode: toHashtagModeEnum(input.hashtagMode),
      hashtags: input.hashtags,
      language: input.language,
    }),
    localizedContent,
  };
}

export async function createPost(userId: string, input: CreatePostInput): Promise<PostPublic> {
  await planService.assertCanCreatePost(userId);

  if (input.scheduledFor) {
    await planService.assertCanSchedule(userId, input.scheduledFor);
  }

  const accounts = await validateTargets(userId, input.targets);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const hasRedditTarget = input.targets.some(
    (t) => accountMap.get(t.socialAccountId)?.platform === "REDDIT",
  );
  if (hasRedditTarget && !input.title?.trim()) {
    throw new AppError(400, "Title is required when posting to Reddit");
  }

  const localizedContent = await localizeContent(input.content, input.language, userId);

  const post = await prisma.post.create({
    data: {
      userId,
      content: localizedContent,
      title: input.title,
      images: input.images,
      hashtagMode: toHashtagModeEnum(input.hashtagMode),
      hashtags: input.hashtags,
      language: input.language,
      status: input.scheduledFor ? "SCHEDULED" : "DRAFT",
      scheduledFor: input.scheduledFor ?? null,
      targets: {
        create: input.targets.map((t) => ({
          socialAccountId: t.socialAccountId,
          platform: accountMap.get(t.socialAccountId)!.platform,
          customContent: t.customContent,
          subreddit: t.subreddit,
        })),
      },
    },
    include: postInclude,
  });

  await recordActivity({
    userId,
    action: "POST_CREATE",
    path: "/posts",
    meta: { postId: post.id, status: post.status },
  });

  if (input.publish) {
    return publishPost(userId, post.id);
  }

  const imageFolder = input.scheduledFor ? "scheduled" : "drafts";

  if (post.images.length > 0) {
    const archivedImages = await archivePostImages(userId, post.id, post.images, imageFolder);
    const withImages = await prisma.post.update({
      where: { id: post.id },
      data: { images: archivedImages },
      include: postInclude,
    });
    return toPostPublic(withImages);
  }

  return toPostPublic(post);
}

export async function listPosts(
  userId: string,
  filters: PostListFilters = {},
): Promise<PostPublic[]> {
  const posts = await prisma.post.findMany({
    where: buildPostWhere(userId, filters),
    orderBy: { createdAt: "desc" },
    include: {
      targets: { include: { socialAccount: { select: { accountName: true } } } },
    },
  });

  return posts.map(toPostPublic);
}

export async function getPost(userId: string, postId: string): Promise<PostPublic> {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
    include: {
      targets: { include: { socialAccount: { select: { accountName: true } } } },
    },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  return toPostPublic(post);
}

export async function updatePost(
  userId: string,
  postId: string,
  input: UpdatePostInput,
): Promise<PostPublic> {
  const existing = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!existing) {
    throw new AppError(404, "Post not found");
  }

  assertEditable(existing);

  if (input.scheduledFor) {
    await planService.assertCanSchedule(userId, input.scheduledFor);
  }

  if (input.targets) {
    await validateTargets(userId, input.targets);
    await prisma.postTarget.deleteMany({ where: { postId } });

    const accounts = await prisma.socialAccount.findMany({
      where: { userId, id: { in: input.targets.map((t) => t.socialAccountId) } },
    });
    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    await prisma.postTarget.createMany({
      data: input.targets.map((t) => ({
        postId,
        socialAccountId: t.socialAccountId,
        platform: accountMap.get(t.socialAccountId)!.platform,
        customContent: t.customContent,
        subreddit: t.subreddit,
      })),
    });
  }

  const language = input.language ?? existing.language;
  const localizedContent =
    input.content !== undefined
      ? await localizeContent(input.content, language, userId)
      : undefined;

  const nextScheduledFor =
    input.scheduledFor === null
      ? null
      : input.scheduledFor !== undefined
        ? input.scheduledFor
        : existing.scheduledFor;

  let nextStatus = existing.status;
  if (input.scheduledFor !== undefined) {
    if (input.scheduledFor === null) {
      nextStatus = existing.status === "SCHEDULED" ? "DRAFT" : existing.status;
    } else {
      nextStatus = "SCHEDULED";
    }
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(localizedContent !== undefined ? { content: localizedContent } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.images !== undefined ? { images: input.images } : {}),
      ...(input.hashtagMode !== undefined
        ? { hashtagMode: toHashtagModeEnum(input.hashtagMode) }
        : {}),
      ...(input.hashtags !== undefined ? { hashtags: input.hashtags } : {}),
      ...(input.language !== undefined ? { language: input.language } : {}),
      ...(input.scheduledFor !== undefined
        ? { scheduledFor: nextScheduledFor, status: nextStatus }
        : {}),
    },
    include: postInclude,
  });

  return toPostPublic(post);
}

export async function trashPost(userId: string, postId: string): Promise<void> {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId, deletedAt: null },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });
}

export async function restorePost(userId: string, postId: string): Promise<PostPublic> {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId, deletedAt: { not: null } },
    include: {
      targets: { include: { socialAccount: { select: { accountName: true } } } },
    },
  });

  if (!post) {
    throw new AppError(404, "Trashed post not found");
  }

  const restored = await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: null },
    include: {
      targets: { include: { socialAccount: { select: { accountName: true } } } },
    },
  });

  return toPostPublic(restored);
}

export async function deletePost(
  userId: string,
  postId: string,
  permanent = false,
): Promise<void> {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (permanent) {
    if (!post.deletedAt) {
      throw new AppError(400, "Move post to trash before permanent delete");
    }

    await moveImagesToTrash(userId, post.images);
    await prisma.post.delete({ where: { id: postId } });
    return;
  }

  await trashPost(userId, postId);
}

export async function publishPost(
  userId: string,
  postId: string,
  options?: { alreadyClaimed?: boolean },
): Promise<PostPublic> {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
    include: {
      targets: {
        include: { socialAccount: { select: { accountName: true } } },
      },
    },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  assertNotTrashed(post);

  if (post.status === "PUBLISHED") {
    throw new AppError(400, "Post is already published");
  }

  if (post.status === "PUBLISHING" && !options?.alreadyClaimed) {
    throw new AppError(400, "Post is already being published");
  }

  if (post.status !== "PUBLISHING") {
    await prisma.post.update({
      where: { id: postId },
      data: { status: "PUBLISHING" },
    });
  }

  const resolvedTags = resolveHashtags(
    post.hashtagMode,
    post.hashtags,
    post.content,
    post.language,
  );
  const finalContent = buildFinalContent(post.content, resolvedTags);

  const unifiedPost: UnifiedPost = {
    content: finalContent,
    title: post.title ?? undefined,
    images: post.images,
  };

  let successCount = 0;
  let failCount = 0;

  for (const target of post.targets) {
    if (target.status === "SUCCESS") {
      successCount++;
      continue;
    }

    await prisma.postTarget.update({
      where: { id: target.id },
      data: { status: "PUBLISHING" },
    });

    try {
      const adapter = getPlatformAdapter(target.platform);
      const tokenData = await accountsService.getDecryptedTokenFresh(
        target.socialAccountId,
        userId,
      );

      const postForPlatform: UnifiedPost = {
        ...unifiedPost,
        customContent: target.customContent
          ? buildFinalContent(target.customContent, resolvedTags)
          : undefined,
      };

      const validation = adapter.validateContent(postForPlatform);
      if (!validation.valid) {
        throw new Error(validation.errors.join("; "));
      }

      const publishMetadata: Record<string, unknown> = {
        ...tokenData.metadata,
        ...(target.subreddit ? { subreddit: target.subreddit } : {}),
      };

      const result = await adapter.publishPost(
        postForPlatform,
        tokenData.accessToken,
        tokenData.accountId,
        publishMetadata,
      );

      await prisma.publishLog.create({
        data: {
          postId,
          socialAccountId: target.socialAccountId,
          action: "PUBLISH",
          status: result.success ? "SUCCESS" : "FAILED",
          responsePayload: result as unknown as Prisma.InputJsonValue,
          errorMessage: result.error,
        },
      });

      if (result.success) {
        await prisma.postTarget.update({
          where: { id: target.id },
          data: {
            status: "SUCCESS",
            platformPostId: result.platformPostId,
            publishedAt: new Date(),
            errorMessage: null,
          },
        });
        successCount++;
      } else {
        await prisma.postTarget.update({
          where: { id: target.id },
          data: {
            status: "FAILED",
            errorMessage: result.error,
          },
        });
        failCount++;
      }
    } catch (error) {
      const raw = error instanceof Error ? error.message : "Unknown error";
      const message = /401|403|unauthorized|token|expired/i.test(raw)
        ? `${raw} — Accounts page se reconnect karo`
        : raw;

      await prisma.publishLog.create({
        data: {
          postId,
          socialAccountId: target.socialAccountId,
          action: "PUBLISH",
          status: "FAILED",
          errorMessage: message,
        },
      });

      await prisma.postTarget.update({
        where: { id: target.id },
        data: { status: "FAILED", errorMessage: message },
      });

      failCount++;
    }
  }

  let finalStatus: PostStatus;
  if (successCount > 0 && failCount === 0) {
    finalStatus = "PUBLISHED";
  } else if (successCount > 0 && failCount > 0) {
    finalStatus = "PARTIAL";
  } else {
    finalStatus = "FAILED";
  }

  if (finalStatus === "FAILED" || finalStatus === "PARTIAL") {
    void recordSystemError({
      message: `Post ${postId} publish ${finalStatus.toLowerCase()} (${failCount} failed)`,
      userId,
      path: "/posts/publish",
      meta: { postId, successCount, failCount, finalStatus },
    });
    void createSupportIssue({
      title: `Publish ${finalStatus.toLowerCase()}: post ${postId}`,
      body: `User ${userId} post ${postId} ended as ${finalStatus}. Success=${successCount}, fail=${failCount}.`,
      source: "PUBLISH_FAIL",
      userId,
      priority: finalStatus === "FAILED" ? "high" : "medium",
    });
  } else {
    await recordActivity({
      userId,
      action: "POST_PUBLISH",
      path: "/posts/publish",
      meta: { postId, successCount },
    });
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      status: finalStatus,
      publishedAt: successCount > 0 ? new Date() : null,
      ...(successCount > 0 ? { scheduledFor: null } : {}),
      ...(successCount > 0
        ? {
            images: await archivePostImages(userId, postId, post.images, "published"),
          }
        : {}),
    },
    include: {
      targets: { include: { socialAccount: { select: { accountName: true } } } },
    },
  });

  return toPostPublic(updated);
}

export async function retryPost(userId: string, postId: string): Promise<PostPublic> {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId, deletedAt: null },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (post.status !== "FAILED" && post.status !== "PARTIAL") {
    throw new AppError(400, "Only failed or partial posts can be retried");
  }

  return publishPost(userId, postId);
}

export async function getPublishLogs(userId: string, postId: string) {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  const logs = await prisma.publishLog.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    include: {
      socialAccount: { select: { platform: true, accountName: true } },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    status: log.status,
    platform: log.socialAccount.platform,
    accountName: log.socialAccount.accountName,
    errorMessage: log.errorMessage,
    createdAt: log.createdAt.toISOString(),
  }));
}

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
  status: PostStatus;
  scheduledFor: string | null;
  publishedAt: string | null;
  platforms: Platform[];
  imageCount: number;
  createdAt: string;
};

export async function getPostCounts(userId: string): Promise<PostCounts> {
  const baseWhere = { userId };
  const activeWhere = { userId, deletedAt: null };

  const [all, drafts, scheduled, published, trashed, failed] = await Promise.all([
    prisma.post.count({ where: activeWhere }),
    prisma.post.count({ where: { ...activeWhere, status: { in: DRAFT_STATUSES } } }),
    prisma.post.count({ where: { ...activeWhere, status: { in: SCHEDULED_STATUSES } } }),
    prisma.post.count({
      where: { ...activeWhere, status: { in: PUBLISHED_TAB_STATUSES } },
    }),
    prisma.post.count({ where: { ...baseWhere, deletedAt: { not: null } } }),
    prisma.post.count({ where: { ...activeWhere, status: "FAILED" } }),
  ]);

  return { all, drafts, scheduled, published, trashed, failed };
}

export async function listCalendarPosts(
  userId: string,
  from: Date,
  to: Date,
): Promise<CalendarPostItem[]> {
  const posts = await prisma.post.findMany({
    where: {
      userId,
      deletedAt: null,
      OR: [
        { scheduledFor: { gte: from, lte: to } },
        { publishedAt: { gte: from, lte: to } },
      ],
    },
    orderBy: [{ scheduledFor: "asc" }, { publishedAt: "asc" }],
    include: {
      targets: { select: { platform: true } },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    contentPreview: post.content.trim().slice(0, 120) || "(image post)",
    status: post.status,
    scheduledFor: post.scheduledFor?.toISOString() ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    platforms: [...new Set(post.targets.map((t) => t.platform))],
    imageCount: post.images.length,
    createdAt: post.createdAt.toISOString(),
  }));
}

export async function schedulePost(
  userId: string,
  postId: string,
  scheduledFor: Date,
): Promise<PostPublic> {
  const existing = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!existing) {
    throw new AppError(404, "Post not found");
  }

  assertEditable(existing);

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "SCHEDULED",
      scheduledFor,
    },
  });

  return fetchPostPublic(postId);
}

export async function cancelSchedule(userId: string, postId: string): Promise<PostPublic> {
  const existing = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!existing) {
    throw new AppError(404, "Post not found");
  }

  assertNotTrashed(existing);

  if (existing.status !== "SCHEDULED") {
    throw new AppError(400, "Only scheduled posts can be unscheduled");
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "DRAFT",
      scheduledFor: null,
    },
  });

  return fetchPostPublic(postId);
}

export async function claimScheduledPost(postId: string): Promise<boolean> {
  const result = await prisma.post.updateMany({
    where: { id: postId, status: "SCHEDULED", deletedAt: null },
    data: { status: "PUBLISHING" },
  });
  return result.count > 0;
}

export async function listDueScheduledPosts(limit = 20) {
  return prisma.post.findMany({
    where: {
      status: "SCHEDULED",
      deletedAt: null,
      scheduledFor: { lte: new Date() },
    },
    orderBy: { scheduledFor: "asc" },
    take: limit,
    select: { id: true, userId: true, scheduledFor: true },
  });
}
