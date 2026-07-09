import sharp from "sharp";
import { randomUUID } from "crypto";
import { prisma } from "../config/database.js";
import { deleteFromS3, getPublicUrl, isS3Configured, uploadToS3 } from "../config/s3.js";
import { AppError } from "../middleware/error.middleware.js";
import type { MediaItem } from "../types/index.js";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

async function processImage(buffer: Buffer, mimeType: string) {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  let processed = image.rotate();

  if ((metadata.width ?? 0) > 2000 || (metadata.height ?? 0) > 2000) {
    processed = processed.resize({
      width: 2000,
      height: 2000,
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

  const { buffer, width, height, sizeBytes } = await processImage(
    file.buffer,
    file.mimetype,
  );

  const ext = MIME_TO_EXT[file.mimetype] ?? "jpg";
  const key = `media/${userId}/${randomUUID()}.${ext}`;
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

  return media.map(toMediaItem);
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
