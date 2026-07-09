import type { MediaItem } from "../types";

/** View image by media ID (private S3 bucket) */
export function getMediaViewUrl(mediaId: string, token: string): string {
  return `/api/v1/media/${mediaId}/view?token=${encodeURIComponent(token)}`;
}

/** View image by stored S3 URL — used on Posts page */
export function getMediaViewUrlByS3Url(s3Url: string, token: string): string {
  return `/api/v1/media/by-url/view?url=${encodeURIComponent(s3Url)}&token=${encodeURIComponent(token)}`;
}

/** Resolve S3 URL to authenticated view URL */
export function resolveImageSrc(
  imageUrl: string,
  mediaLibrary: MediaItem[],
  token: string | null,
): string {
  if (!token || !imageUrl) return imageUrl;

  const item = mediaLibrary.find((m) => m.url === imageUrl);
  if (item) return getMediaViewUrl(item.id, token);

  if (imageUrl.includes("amazonaws.com") || imageUrl.includes("s3.")) {
    return getMediaViewUrlByS3Url(imageUrl, token);
  }

  return imageUrl;
}
