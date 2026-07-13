import "dotenv/config";
import { prisma } from "../src/config/database.js";
import { getBillingStatus } from "../src/services/plan.service.js";

const EMAIL = "haseebcodejourney@gmail.com";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: {
      accounts: { where: { isActive: true } },
    },
  });

  if (!user) {
    console.log("User not found");
    process.exit(1);
  }

  const billing = await getBillingStatus(user.id);
  const recent = await prisma.post.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      status: true,
      createdAt: true,
      content: true,
      targets: { select: { platform: true, status: true, errorMessage: true } },
    },
  });

  console.log("\n=== Publish Diagnostics ===\n");
  console.log("User:", user.email);
  console.log("DB tier:", user.subscriptionTier);
  console.log("Effective tier:", billing.subscription.tier);
  console.log("Premier:", billing.subscription.premierMember);
  console.log("Posts this month:", billing.usage.postsThisMonth, "/", billing.subscription.plan.limits.maxPostsPerMonth);
  console.log("Connected accounts:", user.accounts.length);
  for (const acc of user.accounts) {
    console.log(`  - ${acc.platform}: ${acc.accountName} (${acc.id})`);
  }
  console.log("\nRecent posts:");
  for (const post of recent) {
    console.log(`  ${post.createdAt.toISOString()} | ${post.status} | ${post.content.slice(0, 40)}...`);
    for (const t of post.targets) {
      console.log(`    ${t.platform}: ${t.status}${t.errorMessage ? ` — ${t.errorMessage}` : ""}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
