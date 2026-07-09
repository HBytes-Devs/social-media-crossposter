/**
 * Publish a custom LinkedIn image post — npx tsx scripts/publish-now.ts [image-path]
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as authService from "../src/services/auth.service.js";
import * as accountsService from "../src/services/accounts.service.js";
import * as mediaService from "../src/services/media.service.js";
import * as postsService from "../src/services/posts.service.js";

const EMAIL = "haseebcodejourney@gmail.com";
const PASSWORD = "SMC@Hamza2026!";

const CONTENT = `🚀 Building Social Media Crossposter (SMC) — ek hi jagah se multiple platforms par post karo!

Stack: Node.js + React + PostgreSQL + AWS S3 + LinkedIn API

✅ Auth system
✅ S3 image upload
✅ LinkedIn OAuth connect
✅ Text + Image posts — live!

Software engineers ke liye jo tech content share karte hain — yeh project unke liye hai.

#webdev #nodejs #typescript #linkedin #aws #buildinpublic #softwareengineer`;

async function main() {
  const imagePath =
    process.argv[2] ??
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "..",
      ".cursor",
      "projects",
      "c-Users-micro-social-media-crossposter",
      "assets",
      "smc-linkedin-post.png",
    );

  if (!fs.existsSync(imagePath)) {
    console.error("❌ Image not found:", imagePath);
    process.exit(1);
  }

  const ext = path.extname(imagePath).toLowerCase();
  const mimeType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  console.log("\n=== Publishing LinkedIn Image Post ===\n");

  const { user } = await authService.login({ email: EMAIL, password: PASSWORD });
  const linkedIn = (await accountsService.listAccounts(user.id)).find(
    (a) => a.platform === "LINKEDIN",
  );
  if (!linkedIn) {
    console.error("❌ LinkedIn not connected.");
    process.exit(1);
  }

  const buffer = fs.readFileSync(imagePath);
  const media = await mediaService.uploadImage(user.id, {
    fieldname: "images",
    originalname: path.basename(imagePath),
    encoding: "7bit",
    mimetype: mimeType,
    buffer,
    size: buffer.length,
  } as Express.Multer.File);

  console.log("✅ Image uploaded:", media.url);

  const post = await postsService.createPost(user.id, {
    content: CONTENT,
    images: [media.url],
    targets: [{ socialAccountId: linkedIn.id }],
    publish: true,
  });

  console.log("\n📋 Status:", post.status);
  for (const t of post.targets) {
    console.log(`   ${t.platform}: ${t.status}`);
    if (t.platformPostId) console.log("   ID:", t.platformPostId);
    if (t.errorMessage) console.log("   Error:", t.errorMessage);
  }

  if (post.status !== "PUBLISHED") process.exit(1);
  console.log("\n✅ Published! Check your LinkedIn feed.\n");
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
