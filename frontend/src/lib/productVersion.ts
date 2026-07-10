import manifest from "../../../version.json";

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

export const PRODUCT_VERSION = manifest as ProductVersionManifest;

export function getVersionLabel(): string {
  return `${PRODUCT_VERSION.fullVersion} ${PRODUCT_VERSION.channel.toUpperCase()}`;
}
