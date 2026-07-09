/**
 * Test Reddit text post to r/test — run: npx tsx scripts/test-reddit-post.ts
 */
import "dotenv/config";
import * as authService from "../src/services/auth.service.js";
import * as postsService from "../src/services/posts.service.js";
import { prisma } from "../src/config/database.js";

const EMAIL = "haseebcodejourney@gmail.com";
const PASSWORD = "SMC@Hamza2026!";
const SUBREDDIT = "test";

async function main() {
  console.log("\n=== Reddit Test Post ===\n");

  const { user } = await authService.login({ email: EMAIL, password: PASSWORD });

  const redditAccount = await prisma.socialAccount.findFirst({
    where: { userId: user.id, platform: "REDDIT", isActive: true },
  });

  if (!redditAccount) {
    console.error("❌ No Reddit account connected. Run: npx tsx scripts/reddit-connect-url.ts");
    process.exit(1);
  }

  console.log("Reddit account:", redditAccount.accountName);

  const post = await postsService.createPost(user.id, {
    content: `Hello from SMC! Test post at ${new Date().toISOString()}`,
    title: "SMC Reddit integration test",
    images: [],
    hashtagMode: "none",
    hashtags: [],
    language: "en",
    publish: true,
    targets: [
      {
        socialAccountId: redditAccount.id,
        subreddit: SUBREDDIT,
      },
    ],
  });

  console.log("\n✅ Post status:", post.status);
  console.log("Targets:", post.targets.map((t) => `${t.platform}: ${t.status}`).join(", "));

  if (post.targets[0]?.errorMessage) {
    console.error("Error:", post.targets[0].errorMessage);
  }
}

main().catch((e) => {
  console.error("Error:", e instanceof Error ? e.message : e);
  process.exit(1);
});
