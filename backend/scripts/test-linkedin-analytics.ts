/**
 * Test LinkedIn post analytics — run: npx tsx scripts/test-linkedin-analytics.ts <postId>
 */
import "dotenv/config";
import * as authService from "../src/services/auth.service.js";
import * as analyticsService from "../src/services/analytics.service.js";
import { prisma } from "../src/config/database.js";

const EMAIL = "haseebcodejourney@gmail.com";
const PASSWORD = "SMC@Hamza2026!";

async function main() {
  const postId = process.argv[2];

  if (!postId) {
    const latest = await prisma.post.findFirst({
      where: {
        targets: {
          some: {
            platform: "LINKEDIN",
            status: "SUCCESS",
            platformPostId: { not: null },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (!latest) {
      console.error("\nNo LinkedIn post found. Usage: npx tsx scripts/test-linkedin-analytics.ts <postId>\n");
      process.exit(1);
    }

    console.log("\nUsing latest LinkedIn post:", latest.id);
    await run(latest.id);
    return;
  }

  await run(postId);
}

async function run(postId: string) {
  const result = await authService.login({ email: EMAIL, password: PASSWORD });
  const analytics = await analyticsService.getPostAnalytics(result.user.id, postId);

  console.log("\n=== LinkedIn Post Analytics ===\n");
  console.log(JSON.stringify(analytics, null, 2));
  console.log();
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
