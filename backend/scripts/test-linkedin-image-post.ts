/**
 * Test S3 upload + LinkedIn image post — run: npx tsx scripts/test-linkedin-image-post.ts
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
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_IMAGE = path.join(__dirname, "..", "test-image.png");

async function main() {
  console.log("\n=== S3 + LinkedIn Image Post Test ===\n");

  const { user } = await authService.login({ email: EMAIL, password: PASSWORD });
  console.log("✅ Logged in:", user.email);

  const accounts = await accountsService.listAccounts(user.id);
  const linkedIn = accounts.find((a) => a.platform === "LINKEDIN");
  if (!linkedIn) {
    console.error("❌ Connect LinkedIn first.");
    process.exit(1);
  }
  console.log("✅ LinkedIn:", linkedIn.accountName);

  if (!fs.existsSync(TEST_IMAGE)) {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPMz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
      "base64",
    );
    fs.writeFileSync(TEST_IMAGE, png);
  }

  const fileBuffer = fs.readFileSync(TEST_IMAGE);
  const fakeFile = {
    fieldname: "images",
    originalname: "smc-test.png",
    encoding: "7bit",
    mimetype: "image/png",
    buffer: fileBuffer,
    size: fileBuffer.length,
  } as Express.Multer.File;

  console.log("📤 Uploading image to S3...");
  const media = await mediaService.uploadImage(user.id, fakeFile);
  console.log("   ✅ S3 URL:", media.url);

  console.log("📤 Publishing to LinkedIn with image...");
  const post = await postsService.createPost(user.id, {
    content: "🖼️ SMC image post test — uploaded via S3 + published to LinkedIn!\n\n#webdev #nodejs #automation",
    images: [media.url],
    targets: [{ socialAccountId: linkedIn.id }],
    publish: true,
  });

  console.log("\n📋 Result:");
  console.log("   Post status:", post.status);
  for (const t of post.targets) {
    console.log(`   ${t.platform}: ${t.status}`);
    if (t.errorMessage) console.log("   Error:", t.errorMessage);
    if (t.platformPostId) console.log("   Post ID:", t.platformPostId);
  }

  if (post.status === "PUBLISHED") {
    console.log("\n✅ Image post published! Check your LinkedIn feed.\n");
  } else {
    console.log("\n❌ Publish failed — see errors above.\n");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
