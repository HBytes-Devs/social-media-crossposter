import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { env } from "./env.js";

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function preferLocalMedia(): boolean {
  return env.MEDIA_STORAGE === "local";
}

export function isLocalMediaEnabled(): boolean {
  return env.MEDIA_STORAGE === "local" || env.MEDIA_STORAGE === "auto";
}

export function guessMimeFromKey(key: string): string {
  const ext = path.extname(key).replace(".", "").toLowerCase();
  return EXT_MIME[ext] ?? "image/jpeg";
}

/** Prevent path traversal when mapping S3-style keys onto local disk. */
export function localPathForKey(key: string): string {
  const safe = key.replace(/\.\./g, "").replace(/^[/\\]+/, "");
  return path.join(env.MEDIA_LOCAL_DIR, safe);
}

export async function saveLocalMedia(key: string, body: Buffer): Promise<void> {
  const filePath = localPathForKey(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body);
}

export async function readLocalMedia(key: string): Promise<Buffer | null> {
  try {
    return await readFile(localPathForKey(key));
  } catch {
    return null;
  }
}

export async function deleteLocalMedia(key: string): Promise<void> {
  try {
    await unlink(localPathForKey(key));
  } catch {
    // already gone
  }
}

export function encodeMediaToken(key: string): string {
  return Buffer.from(key, "utf8").toString("base64url");
}

export function decodeMediaToken(token: string): string {
  return Buffer.from(token, "base64url").toString("utf8");
}

/** Public URL platforms (e.g. Instagram) can fetch without auth. */
export function getLocalPublicUrl(key: string): string {
  const token = encodeMediaToken(key);
  return `${env.API_BASE_URL.replace(/\/$/, "")}/api/v1/media/file/${token}`;
}

export function extractLocalMediaKey(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const marker = "/api/v1/media/file/";
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const token = decodeURIComponent(url.pathname.slice(idx + marker.length));
    if (!token) return null;
    const key = decodeMediaToken(token);
    if (!key || key.includes("..")) return null;
    return key;
  } catch {
    return null;
  }
}
