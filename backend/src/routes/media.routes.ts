import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import * as mediaService from "../services/media.service.js";

const router = Router();

/** Public media bytes for platform crawlers (Instagram/Meta). No auth. */
router.get("/file/:token", async (req, res) => {
  const file = await mediaService.getPublicMediaFile(String(req.params.token));

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.send(file.buffer);
});

router.get("/status", authenticate, async (_req, res) => {
  const status = await mediaService.getMediaStatus();

  res.json({
    success: true,
    data: status,
  });
});

router.post("/upload", authenticate, upload.array("images", 10), async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }

  const files = req.files as Express.Multer.File[] | undefined;

  if (!files?.length) {
    throw new AppError(400, "No images provided. Use field name: images");
  }

  const media = await mediaService.uploadImages(req.userId, files);

  res.status(201).json({
    success: true,
    message: `${media.length} image(s) uploaded successfully`,
    data: { media },
  });
});

router.get("/", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }

  const media = await mediaService.listMedia(req.userId);

  res.json({
    success: true,
    data: { media },
  });
});

router.get("/by-url/view", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }

  const url = String(req.query.url ?? "");
  if (!url) {
    throw new AppError(400, "url query parameter is required");
  }

  const file = await mediaService.getMediaFileByUrl(req.userId, url);

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.send(file.buffer);
});

router.get("/:id/view", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }

  const file = await mediaService.getMediaFile(req.userId, String(req.params.id));

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.send(file.buffer);
});

router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  if (!req.userId) {
    throw new AppError(401, "Authentication required");
  }

  const mediaId = String(req.params.id);
  await mediaService.deleteMedia(req.userId, mediaId);

  res.json({
    success: true,
    message: "Media deleted successfully",
  });
});

export default router;
