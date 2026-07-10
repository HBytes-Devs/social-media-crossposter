import sharp from "sharp";
import { randomUUID } from "crypto";
import { prisma } from "../config/database.js";
import { deleteFromS3, getPublicUrl, isS3Configured, uploadToS3 } from "../config/s3.js";
import { AppError } from "../middleware/error.middleware.js";
import { LINKEDIN_IMAGE, validateLinkedInDimensions } from "../lib/linkedin-image.js";
import { buildUserMediaKey } from "../lib/s3-paths.js";
import type { MediaItem } from "../types/index.js";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function normalizeFileStem(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s*-\s*copy\s*$/i, "")
    .trim()
    .toLowerCase();
}

function mediaDedupeKey(item: {
  width: number | null;
  height: number | null;
  sizeBytes: number;
  fileName: string;
}): string {
  const stem = normalizeFileStem(item.fileName);
  return `${item.width ?? 0}x${item.height ?? 0}:${stem}`;
}

function dedupeMediaRecords<
  T extends {
    id: string;
    s3Url: string;
    width: number | null;
    height: number | null;
    sizeBytes: number;
    fileName: string;
    createdAt: Date;
  },
>(items: T[]): T[] {
  const byKey = new Map<string, T>();

  for (const item of items) {
    const key = mediaDedupeKey(item);
    const existing = byKey.get(key);

    if (!existing || item.createdAt > existing.createdAt) {
      byKey.set(key, item);
    }
  }

  return Array.from(byKey.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

function dedupeByPixelFingerprint<
  T extends {
    width: number | null;
    height: number | null;
    sizeBytes: number;
    createdAt: Date;
  },
>(items: T[]): T[] {
  const result: T[] = [];

  for (const item of items) {
    const duplicate = result.find(
      (existing) =>
        existing.width === item.width &&
        existing.height === item.height &&
        existing.sizeBytes === item.sizeBytes,
    );

    if (!duplicate) {
      result.push(item);
    }
  }

  return result;
}

function toMediaItem(media: {
  id: string;
  s3Key: string;
  s3Url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
}): MediaItem {
  return {
    id: media.id,
    url: media.s3Url,
    fileName: media.fileName,
    mimeType: media.mimeType,
    sizeBytes: media.sizeBytes,
    width: media.width,
    height: media.height,
    createdAt: media.createdAt.toISOString(),
  };
}

function ensureS3Configured(): void {
  if (!isS3Configured()) {
    throw new AppError(
      503,
      "S3 is not configured. Add AWS credentials to backend/.env",
    );
  }
}

async function processImage(buffer: Buffer, mimeType: string, fileName: string) {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  validateLinkedInDimensions(width, height, fileName);

  let processed = image.rotate();

  // LinkedIn-optimized: max width 1200px, maintain aspect ratio
  if (width > LINKEDIN_IMAGE.optimizeWidth || height > LINKEDIN_IMAGE.optimizeWidth) {
    processed = processed.resize({
      width: LINKEDIN_IMAGE.optimizeWidth,
      height: LINKEDIN_IMAGE.optimizeWidth,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (mimeType === "image/jpeg") {
    processed = processed.jpeg({ quality: 85, mozjpeg: true });
  } else if (mimeType === "image/png") {
    processed = processed.png({ compressionLevel: 8 });
  } else {
    processed = processed.webp({ quality: 85 });
  }

  const output = await processed.toBuffer({ resolveWithObject: true });

  if (output.data.length > LINKEDIN_IMAGE.maxBytes) {
    throw new AppError(
      400,
      `${fileName}: Image exceeds 8 MB after optimization (LinkedIn limit)`,
    );
  }

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
    sizeBytes: output.data.length,
  };
}

export async function uploadImage(
  userId: string,
  file: Express.Multer.File,
): Promise<MediaItem> {
  ensureS3Configured();

  const sourceMeta = await sharp(file.buffer).metadata();
  const sourceWidth = sourceMeta.width ?? 0;
  const sourceHeight = sourceMeta.height ?? 0;

  const existing = await prisma.media.findFirst({
    where: {
      userId,
      fileName: file.originalname,
      width: sourceWidth,
      height: sourceHeight,
      sizeBytes: file.size,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return toMediaItem(existing);
  }

  const { buffer, width, height, sizeBytes } = await processImage(
    file.buffer,
    file.mimetype,
    file.originalname,
  );

  const processedKey = mediaDedupeKey({
    width,
    height,
    sizeBytes,
    fileName: file.originalname,
  });

  const existingProcessed = (
    await prisma.media.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
  ).find((item) => mediaDedupeKey(item) === processedKey);

  if (existingProcessed) {
    return toMediaItem(existingProcessed);
  }

  const ext = MIME_TO_EXT[file.mimetype] ?? "jpg";
  const key = buildUserMediaKey(userId, `${randomUUID()}.${ext}`);
  const contentType = file.mimetype;

  await uploadToS3(key, buffer, contentType);

  const media = await prisma.media.create({
    data: {
      userId,
      s3Key: key,
      s3Url: getPublicUrl(key),
      fileName: file.originalname,
      mimeType: contentType,
      sizeBytes,
      width,
      height,
    },
  });

  return toMediaItem(media);
}

export async function uploadImages(
  userId: string,
  files: Express.Multer.File[],
): Promise<MediaItem[]> {
  if (files.length === 0) {
    throw new AppError(400, "At least one image is required");
  }

  const results: MediaItem[] = [];

  for (const file of files) {
    const item = await uploadImage(userId, file);
    results.push(item);
  }

  return results;
}

export async function listMedia(userId: string): Promise<MediaItem[]> {
  const media = await prisma.media.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return dedupeByPixelFingerprint(dedupeMediaRecords(media)).map(toMediaItem);
}

export async function deleteMedia(userId: string, mediaId: string): Promise<void> {
  const media = await prisma.media.findFirst({
    where: { id: mediaId, userId },
  });

  if (!media) {
    throw new AppError(404, "Media not found");
  }

  try {
    await deleteFromS3(media.s3Key);
  } catch {
    // S3 file may already be deleted — still remove DB record
  }

  await prisma.media.delete({
    where: { id: mediaId },
  });
}

export async function getMediaStatus(): Promise<{ configured: boolean }> {
  return { configured: isS3Configured() };
}

export async function getMediaFile(
  userId: string,
  mediaId: string,
): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  const media = await prisma.media.findFirst({
    where: { id: mediaId, userId },
  });

  if (!media) {
    throw new AppError(404, "Media not found");
  }

  return streamMediaFile(media);
}

export async function getMediaFileByUrl(
  userId: string,
  s3Url: string,
): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  const media = await prisma.media.findFirst({
    where: { userId, s3Url },
  });

  if (!media) {
    throw new AppError(404, "Media not found for this URL");
  }

  return streamMediaFile(media);
}

async function streamMediaFile(media: {
  s3Url: string;
  fileName: string;
  mimeType: string;
}): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  if (!isS3Configured()) {
    throw new AppError(503, "S3 is not configured");
  }

  const { downloadImageBytes } = await import("../config/s3.js");
  const { buffer, mimeType } = await downloadImageBytes(media.s3Url);

  return {
    buffer,
    mimeType,
    fileName: media.fileName,
  };
}
