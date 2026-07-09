import { Router } from "express";
import type { PostStatus } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import * as postsService from "../services/posts.service.js";
import { createPostSchema, previewPostSchema, updatePostSchema } from "../validators/post.validator.js";

const router = Router();

const VALID_STATUSES = new Set<string>([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHING",
  "PUBLISHED",
  "FAILED",
  "PARTIAL",
]);

router.get("/options", authenticate, async (_req: AuthRequest, res) => {
  const options = postsService.getPostOptions();
  res.json({ success: true, data: options });
});

router.post("/preview", authenticate, async (req: AuthRequest, res) => {
  const input = previewPostSchema.parse(req.body);
  const preview = postsService.previewPostContent(input);

  res.json({
    success: true,
    data: {
      finalContent: preview.finalContent,
      hashtags: preview.hashtags,
    },
  });
});

router.post("/", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const input = createPostSchema.parse(req.body);
  const post = await postsService.createPost(req.userId, input);

  res.status(201).json({
    success: true,
    message: input.publish ? "Post published" : "Post created as draft",
    data: { post },
  });
});

router.get("/", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  const statusParam = req.query.status ? String(req.query.status) : undefined;
  const status =
    statusParam && VALID_STATUSES.has(statusParam)
      ? (statusParam as PostStatus)
      : undefined;

  const posts = await postsService.listPosts(req.userId, status);

  res.json({ success: true, data: { posts } });
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

router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) throw new AppError(401, "Authentication required");

  await postsService.deletePost(req.userId, String(req.params.id));

  res.json({ success: true, message: "Post deleted" });
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
