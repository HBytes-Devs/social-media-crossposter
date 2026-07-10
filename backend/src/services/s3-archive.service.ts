import { randomUUID } from "crypto";
import {
  copyInS3,
  deleteFromS3,
  getPublicUrl,
  isS3Configured,
  moveInS3,
} from "../config/s3.js";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import {
  buildUserPostAssetKey,
  buildUserTrashKey,
  type S3PostFolder,
} from "../lib/s3-paths.js";

function extractKeyFromUrl(imageUrl: string): string | null {
  if (!isS3Configured() || !env.AWS_S3_BUCKET || !imageUrl.includes(env.AWS_S3_BUCKET)) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    return decodeURIComponent(url.pathname.slice(1));
  } catch {
    return null;
  }
}

async function relocateImageUrl(
  userId: string,
  imageUrl: string,
  folder: S3PostFolder,
  postId: string,
): Promise<string> {
  const sourceKey = extractKeyFromUrl(imageUrl);
  if (!sourceKey) return imageUrl;

  const fileName = sourceKey.split("/").pop() ?? `${randomUUID()}.jpg`;
  const destKey = buildUserPostAssetKey(userId, postId, folder, fileName);

  if (sourceKey === destKey) return imageUrl;

  try {
    await moveInS3(sourceKey, destKey);
    const newUrl = getPublicUrl(destKey);

    await prisma.media.updateMany({
      where: { userId, s3Key: sourceKey },
      data: { s3Key: destKey, s3Url: newUrl },
    });

    return newUrl;
  } catch {
    return imageUrl;
  }
}

export async function archivePostImages(
  userId: string,
  postId: string,
  imageUrls: string[],
  folder: S3PostFolder,
): Promise<string[]> {
  if (!isS3Configured() || imageUrls.length === 0) return imageUrls;

  const results: string[] = [];
  for (const url of imageUrls) {
    results.push(await relocateImageUrl(userId, url, folder, postId));
  }
  return results;
}

export async function moveImagesToTrash(userId: string, imageUrls: string[]): Promise<void> {
  if (!isS3Configured()) return;

  for (const imageUrl of imageUrls) {
    const sourceKey = extractKeyFromUrl(imageUrl);
    if (!sourceKey) continue;

    const fileName = `${Date.now()}-${sourceKey.split("/").pop() ?? randomUUID()}`;
    const destKey = buildUserTrashKey(userId, fileName);

    try {
      await copyInS3(sourceKey, destKey);
      await deleteFromS3(sourceKey);
      await prisma.media.deleteMany({ where: { userId, s3Key: sourceKey } });
    } catch {
      // Best-effort cleanup
    }
  }
}
