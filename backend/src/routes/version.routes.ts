import { Router } from "express";
import { getProductVersion } from "../lib/product-version.js";

const router = Router();

router.get("/", (_req, res) => {
  const manifest = getProductVersion();

  res.json({
    success: true,
    data: {
      product: manifest.product,
      shortName: manifest.shortName,
      version: manifest.version,
      channel: manifest.channel,
      prerelease: manifest.prerelease,
      fullVersion: manifest.fullVersion,
      apiVersion: manifest.apiVersion,
      releaseDate: manifest.releaseDate,
      codename: manifest.codename,
      status: manifest.status,
    },
  });
});

export default router;
