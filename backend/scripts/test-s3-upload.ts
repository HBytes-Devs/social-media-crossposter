/**
 * Local S3 upload test — run: npx tsx scripts/test-s3-upload.ts
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isS3Configured } from "../src/config/s3.js";
import * as authService from "../src/services/auth.service.js";
import * as mediaService from "../src/services/media.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_EMAIL = "haseebcodejourney@gmail.com";
const TEST_PASSWORD = "SMC@Hamza2026!";
const TEST_IMAGE = path.join(__dirname, "..", "test-image.png");

async function main() {
  console.log("\n=== SMC S3 Upload Test ===\n");

  // 1. S3 configured?
  console.log("1. S3 configured:", isS3Configured() ? "✅ YES" : "❌ NO");
  if (!isS3Configured()) {
    console.error("   Add AWS credentials to backend/.env");
    process.exit(1);
  }

  // 2. Login
  console.log("2. Logging in...");
  const { user } = await authService.login({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  console.log("   ✅ Logged in as:", user.email);

  // 3. Ensure test image exists
  if (!fs.existsSync(TEST_IMAGE)) {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
      "base64",
    );
    fs.writeFileSync(TEST_IMAGE, png);
  }

  // 4. Upload
  console.log("3. Uploading test image to S3...");
  const fileBuffer = fs.readFileSync(TEST_IMAGE);
  const fakeFile = {
    fieldname: "images",
    originalname: "test-image.png",
    encoding: "7bit",
    mimetype: "image/png",
    buffer: fileBuffer,
    size: fileBuffer.length,
  } as Express.Multer.File;

  const uploaded = await mediaService.uploadImage(user.id, fakeFile);
  console.log("   ✅ Upload success!");
  console.log("   URL:", uploaded.url);
  console.log("   ID:", uploaded.id);
  console.log("   Size:", uploaded.sizeBytes, "bytes");

  // 5. List media
  console.log("4. Listing user media...");
  const list = await mediaService.listMedia(user.id);
  console.log("   ✅ Total files:", list.length);

  // 6. Delete test file (cleanup)
  console.log("5. Cleaning up test file...");
  await mediaService.deleteMedia(user.id, uploaded.id);
  console.log("   ✅ Deleted from S3 + DB");

  console.log("\n=== All S3 tests passed! ===\n");
}

main().catch((err) => {
  console.error("\n❌ Test failed:", err.message);
  if (err.Code) console.error("   AWS Error:", err.Code);
  process.exit(1);
});
