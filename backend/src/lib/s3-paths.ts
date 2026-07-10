import { env } from "../config/env.js";

/** Root folder in the S3 bucket for all SMC data */
export const S3_ROOT_PREFIX = (env.AWS_S3_ROOT_PREFIX ?? "smc").replace(/^\/+|\/+$/g, "");

export type S3PostFolder = "drafts" | "scheduled" | "published" | "trash";

export function buildUserMediaKey(userId: string, fileName: string): string {
  return `${S3_ROOT_PREFIX}/users/${userId}/media/${fileName}`;
}

export function buildUserPostAssetKey(
  userId: string,
  postId: string,
  folder: S3PostFolder,
  fileName: string,
): string {
  return `${S3_ROOT_PREFIX}/users/${userId}/posts/${folder}/${postId}/${fileName}`;
}

export function buildUserTrashKey(userId: string, fileName: string): string {
  return `${S3_ROOT_PREFIX}/users/${userId}/trash/${fileName}`;
}

export function isManagedS3Key(key: string): boolean {
  return key.startsWith(`${S3_ROOT_PREFIX}/`) || key.startsWith("media/");
}
