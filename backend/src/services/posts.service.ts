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
import type { CreatePostInput, PreviewPostInput, UpdatePostInput } from "../validators/post.validator.js";
import { fromHashtagModeEnum, toHashtagModeEnum } from "../validators/post.validator.js";
import type { PostPublic, PostTargetPublic } from "../types/index.js";

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

function toPostPublic(post: {
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

export function previewPostContent(input: PreviewPostInput) {
  return previewPost({
    content: input.content,
    hashtagMode: toHashtagModeEnum(input.hashtagMode),
    hashtags: input.hashtags,
    language: input.language,
  });
}

export async function createPost(userId: string, input: CreatePostInput): Promise<PostPublic> {
  const accounts = await validateTargets(userId, input.targets);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const hasRedditTarget = input.targets.some(
    (t) => accountMap.get(t.socialAccountId)?.platform === "REDDIT",
  );
  if (hasRedditTarget && !input.title?.trim()) {
    throw new AppError(400, "Title is required when posting to Reddit");
  }

  const post = await prisma.post.create({
    data: {
      userId,
      content: input.content,
      title: input.title,
      images: input.images,
      hashtagMode: toHashtagModeEnum(input.hashtagMode),
      hashtags: input.hashtags,
      language: input.language,
      status: "DRAFT",
      targets: {
        create: input.targets.map((t) => ({
          socialAccountId: t.socialAccountId,
          platform: accountMap.get(t.socialAccountId)!.platform,
          customContent: t.customContent,
          subreddit: t.subreddit,
        })),
      },
    },
    include: {
      targets: { include: { socialAccount: { select: { accountName: true } } } },
    },
  });

  if (input.publish) {
    return publishPost(userId, post.id);
  }

  return toPostPublic(post);
}

export async function listPosts(
  userId: string,
  status?: PostStatus,
): Promise<PostPublic[]> {
  const posts = await prisma.post.findMany({
    where: { userId, ...(status ? { status } : {}) },
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

  if (existing.status !== "DRAFT") {
    throw new AppError(400, "Only draft posts can be updated");
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

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.images !== undefined ? { images: input.images } : {}),
      ...(input.hashtagMode !== undefined
        ? { hashtagMode: toHashtagModeEnum(input.hashtagMode) }
        : {}),
      ...(input.hashtags !== undefined ? { hashtags: input.hashtags } : {}),
      ...(input.language !== undefined ? { language: input.language } : {}),
    },
    include: {
      targets: { include: { socialAccount: { select: { accountName: true } } } },
    },
  });

  return toPostPublic(post);
}

export async function deletePost(userId: string, postId: string): Promise<void> {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  await prisma.post.delete({ where: { id: postId } });
}

export async function publishPost(userId: string, postId: string): Promise<PostPublic> {
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

  if (post.status === "PUBLISHED") {
    throw new AppError(400, "Post is already published");
  }

  if (post.status === "PUBLISHING") {
    throw new AppError(400, "Post is already being published");
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: "PUBLISHING" },
  });

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
      const tokenData = await accountsService.getDecryptedToken(
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
      const message = error instanceof Error ? error.message : "Unknown error";

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

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      status: finalStatus,
      publishedAt: successCount > 0 ? new Date() : null,
    },
    include: {
      targets: { include: { socialAccount: { select: { accountName: true } } } },
    },
  });

  return toPostPublic(updated);
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
