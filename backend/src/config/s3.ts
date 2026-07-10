import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env.js";

export function isS3Configured(): boolean {
  return Boolean(
    env.AWS_ACCESS_KEY_ID &&
      env.AWS_SECRET_ACCESS_KEY &&
      env.AWS_S3_BUCKET,
  );
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
  if (env.AWS_S3_PUBLIC_URL) {
    return `${env.AWS_S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

function extractS3Key(imageUrl: string): string | null {
  if (!isS3Configured() || !imageUrl.includes(env.AWS_S3_BUCKET!)) {
    return null;
  }

  const url = new URL(imageUrl);
  return decodeURIComponent(url.pathname.slice(1));
}

/** Presigned URL for platforms (Instagram/Meta) that must fetch images from a public URL */
export async function resolvePublicImageUrl(imageUrl: string, expiresIn = 3600): Promise<string> {
  const key = extractS3Key(imageUrl);
  if (!key) {
    return imageUrl;
  }

  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      Key: key,
    }),
    { expiresIn },
  );
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

/** Download image bytes — uses S3 SDK for our bucket, fetch for public URLs */
export async function downloadImageBytes(imageUrl: string): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  if (isS3Configured() && imageUrl.includes(env.AWS_S3_BUCKET!)) {
    const key = extractS3Key(imageUrl);
    if (!key) {
      throw new Error("Invalid S3 image URL");
    }

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET!,
        Key: key,
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
