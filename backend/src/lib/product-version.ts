import { readFileSync } from "node:fs";
import { join } from "node:path";

export type ProductChannel = "alpha" | "beta" | "rc" | "stable";

export type ProductVersionManifest = {
  product: string;
  shortName: string;
  version: string;
  channel: ProductChannel;
  prerelease: string | null;
  fullVersion: string;
  apiVersion: string;
  releaseDate: string;
  codename: string;
  status: string;
};

let cached: ProductVersionManifest | null = null;

function manifestPath(): string {
  return join(process.cwd(), "..", "version.json");
}

function loadManifest(): ProductVersionManifest {
  if (cached) return cached;

  const raw = readFileSync(manifestPath(), "utf8");
  cached = JSON.parse(raw) as ProductVersionManifest;
  return cached;
}

export function getProductVersion(): ProductVersionManifest {
  return loadManifest();
}

export function getVersionLabel(): string {
  const manifest = getProductVersion();
  return `${manifest.fullVersion} ${manifest.channel.toUpperCase()}`;
}
