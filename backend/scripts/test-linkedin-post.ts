/**
 * Test LinkedIn post publish — run: npx tsx scripts/test-linkedin-post.ts
 */
import "dotenv/config";
import * as authService from "../src/services/auth.service.js";
import * as accountsService from "../src/services/accounts.service.js";
import * as postsService from "../src/services/posts.service.js";

const EMAIL = "haseebcodejourney@gmail.com";
const PASSWORD = "SMC@Hamza2026!";

async function main() {
  console.log("\n=== LinkedIn Post Test ===\n");

  const { user } = await authService.login({ email: EMAIL, password: PASSWORD });
  console.log("✅ Logged in:", user.email);

  const accounts = await accountsService.listAccounts(user.id);
  const linkedIn = accounts.find((a) => a.platform === "LINKEDIN");

  if (!linkedIn) {
    console.error("❌ No LinkedIn account connected. Run linkedin-connect-url.ts first.");
    process.exit(1);
  }

  console.log("✅ LinkedIn account:", linkedIn.accountName);

  const post = await postsService.createPost(user.id, {
    content: `🚀 SMC test post — building a social media crossposter!\n\n#webdev #nodejs #linkedin\n\nPosted via Social Media Crossposter API.`,
    images: [],
    targets: [{ socialAccountId: linkedIn.id }],
    publish: true,
  });

  console.log("\n📋 Post result:");
  console.log("   Status:", post.status);
  console.log("   ID:", post.id);

  for (const target of post.targets) {
    console.log(`   ${target.platform}: ${target.status}`);
    if (target.platformPostId) console.log("   Platform post ID:", target.platformPostId);
    if (target.errorMessage) console.log("   Error:", target.errorMessage);
  }

  if (post.status === "PUBLISHED") {
    console.log("\n✅ Post published on LinkedIn! Check your feed.\n");
  } else {
    console.log("\n⚠️  Post not fully published. Check logs above.\n");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
