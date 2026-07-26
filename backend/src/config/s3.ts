import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env.js";
import {
  extractLocalMediaKey,
  getLocalPublicUrl,
  guessMimeFromKey,
  isLocalMediaEnabled,
  preferLocalMedia,
  readLocalMedia,
} from "./local-media.js";

export function isS3Configured(): boolean {
  return Boolean(
    env.AWS_ACCESS_KEY_ID &&
      env.AWS_SECRET_ACCESS_KEY &&
      env.AWS_S3_BUCKET,
  );
}

export function isMediaConfigured(): boolean {
  if (preferLocalMedia()) return true;
  if (isS3Configured()) return true;
  return env.MEDIA_STORAGE === "auto";
}

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  followRegionRedirects: true,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export function getPublicUrl(key: string): string {
  if (preferLocalMedia() || !isS3Configured()) {
    return getLocalPublicUrl(key);
  }

  if (env.AWS_S3_PUBLIC_URL) {
    return `${env.AWS_S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

function extractS3Key(imageUrl: string): string | null {
  if (!isS3Configured() || !env.AWS_S3_BUCKET || !imageUrl.includes(env.AWS_S3_BUCKET)) {
    return null;
  }

  const url = new URL(imageUrl);
  return decodeURIComponent(url.pathname.slice(1));
}

/** Presigned URL for platforms (Instagram/Meta) that must fetch images from a public URL */
export async function resolvePublicImageUrl(imageUrl: string, expiresIn = 3600): Promise<string> {
  const localKey = extractLocalMediaKey(imageUrl);
  if (localKey) {
    return imageUrl;
  }

  const s3Key = extractS3Key(imageUrl);
  if (s3Key) {
    const cached = await readLocalMedia(s3Key);
    if (cached) {
      return getLocalPublicUrl(s3Key);
    }

    if (!isS3Configured()) {
      return imageUrl;
    }

    try {
      return await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: env.AWS_S3_BUCKET!,
          Key: s3Key,
        }),
        { expiresIn },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Cannot create public image URL (S3 denied). Re-upload the image. ${message}`,
      );
    }
  }

  return imageUrl;
}

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured");
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function copyInS3(sourceKey: string, destKey: string): Promise<void> {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured");
  }

  await s3Client.send(
    new CopyObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      CopySource: `${env.AWS_S3_BUCKET}/${sourceKey}`,
      Key: destKey,
    }),
  );
}

export async function moveInS3(sourceKey: string, destKey: string): Promise<void> {
  await copyInS3(sourceKey, destKey);
  await deleteFromS3(sourceKey);
}

export async function deleteFromS3(key: string): Promise<void> {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured");
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      Key: key,
    }),
  );
}

/** Download image bytes — local disk first, then S3 SDK, then HTTP fetch */
export async function downloadImageBytes(imageUrl: string): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  const localKey = extractLocalMediaKey(imageUrl);
  if (localKey) {
    const buffer = await readLocalMedia(localKey);
    if (!buffer) {
      throw new Error("Local media file not found — re-upload the image");
    }
    return { buffer, mimeType: guessMimeFromKey(localKey) };
  }

  const s3Key = extractS3Key(imageUrl);
  if (s3Key) {
    const cached = await readLocalMedia(s3Key);
    if (cached) {
      return { buffer: cached, mimeType: guessMimeFromKey(s3Key) };
    }

    if (isS3Configured()) {
      try {
        const response = await s3Client.send(
          new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET!,
            Key: s3Key,
          }),
        );

        const bytes = await response.Body?.transformToByteArray();
        if (!bytes) {
          throw new Error("Empty image from S3");
        }

        return {
          buffer: Buffer.from(bytes),
          mimeType: response.ContentType ?? "image/jpeg",
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (isLocalMediaEnabled()) {
          throw new Error(
            `S3 GetObject denied/failed — re-upload the image so it is stored locally. ${message}`,
          );
        }
        throw err;
      }
    }
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: response.headers.get("content-type") ?? "image/jpeg",
  };
}
