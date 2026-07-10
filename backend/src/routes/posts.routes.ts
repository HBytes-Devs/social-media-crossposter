import { Router } from "express";

import type { Platform, PostStatus } from "@prisma/client";

import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";

import { AppError } from "../middleware/error.middleware.js";

import * as postsService from "../services/posts.service.js";

import type { PostListTab } from "../services/posts.service.js";

import * as analyticsService from "../services/analytics.service.js";

import {
  calendarQuerySchema,
  createPostSchema,
  previewPostSchema,
  schedulePostSchema,
  updatePostSchema,
} from "../validators/post.validator.js";

const router = Router();

const VALID_STATUSES = new Set<string>([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHING",
  "PUBLISHED",
  "FAILED",
  "PARTIAL",
]);

const VALID_TABS = new Set<string>(["all", "published", "drafts", "scheduled", "trashed"]);

const VALID_PLATFORMS = new Set<string>([
  "LINKEDIN",
  "FACEBOOK",
  "INSTAGRAM",
  "TWITTER",
  "REDDIT",
]);

router.get("/options", authenticate, async (_req: AuthRequest, res) => {
  const options = postsService.getPostOptions();

  res.json({ success: true, data: options });
});

router.get("/counts", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const counts = await postsService.getPostCounts(req.userId);
  res.json({ success: true, data: counts });
});

router.get("/calendar", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const query = calendarQuerySchema.parse({
    from: req.query.from,
    to: req.query.to,
  });

  const posts = await postsService.listCalendarPosts(req.userId, query.from, query.to);
  res.json({
    success: true,
    data: {
      from: query.from.toISOString(),
      to: query.to.toISOString(),
      posts,
    },
  });
});

router.post("/preview", authenticate, async (req: AuthRequest, res) => {
  const input = previewPostSchema.parse(req.body);

  const preview = await postsService.previewPostContent(req.userId!, input);

  res.json({
    success: true,
    data: {
      finalContent: preview.finalContent,
      hashtags: preview.hashtags,
      localizedContent: preview.localizedContent,
    },
  });
});

router.post("/", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const input = createPostSchema.parse(req.body);

  const post = await postsService.createPost(req.userId, input);

  const message = input.publish
    ? "Post published"
    : input.scheduledFor
      ? "Post scheduled"
      : "Post created as draft";

  res.status(201).json({
    success: true,
    message,
    data: { post },
  });
});

router.get("/", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const tabParam = req.query.tab ? String(req.query.tab) : undefined;
  const tab =
    tabParam && VALID_TABS.has(tabParam) ? (tabParam as PostListTab) : undefined;

  const statusParam = req.query.status ? String(req.query.status) : undefined;
  const status =
    statusParam && VALID_STATUSES.has(statusParam)
      ? (statusParam as PostStatus)
      : undefined;

  const platformParam = req.query.platform ? String(req.query.platform) : undefined;
  const platform =
    platformParam && VALID_PLATFORMS.has(platformParam)
      ? (platformParam as Platform)
      : undefined;

  const language = req.query.language ? String(req.query.language) : undefined;

  const posts = await postsService.listPosts(req.userId, {
    tab,
    status,
    platform,
    language,
  });

  res.json({ success: true, data: { posts } });
});

router.get("/:id/analytics", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const analytics = await analyticsService.getPostAnalytics(
    req.userId,
    String(req.params.id),
  );

  res.json({ success: true, data: analytics });
});

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const post = await postsService.getPost(req.userId, String(req.params.id));

  res.json({ success: true, data: { post } });
});

router.patch("/:id", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const input = updatePostSchema.parse(req.body);

  const post = await postsService.updatePost(req.userId, String(req.params.id), input);

  res.json({ success: true, data: { post } });
});

router.post("/:id/schedule", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const input = schedulePostSchema.parse(req.body);
  const post = await postsService.schedulePost(
    req.userId,
    String(req.params.id),
    input.scheduledFor,
  );

  res.json({
    success: true,
    message: "Post scheduled",
    data: { post },
  });
});

router.post("/:id/cancel-schedule", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const post = await postsService.cancelSchedule(req.userId, String(req.params.id));

  res.json({
    success: true,
    message: "Schedule cancelled — post moved to drafts",
    data: { post },
  });
});

router.post("/:id/restore", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const post = await postsService.restorePost(req.userId, String(req.params.id));

  res.json({ success: true, message: "Post restored", data: { post } });
});

router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const permanent = req.query.permanent === "true";

  await postsService.deletePost(req.userId, String(req.params.id), permanent);

  res.json({
    success: true,
    message: permanent ? "Post permanently deleted" : "Post moved to trash",
  });
});

router.post("/:id/publish", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const post = await postsService.publishPost(req.userId, String(req.params.id));

  res.json({
    success: true,
    message: `Post status: ${post.status}`,
    data: { post },
  });
});

router.get("/:id/logs", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const logs = await postsService.getPublishLogs(req.userId, String(req.params.id));

  res.json({ success: true, data: { logs } });
});

export default router;
