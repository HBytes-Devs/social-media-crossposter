import "dotenv/config";
import { prisma } from "../src/config/database.js";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      accounts: {
        where: { isActive: true },
        select: { platform: true, accountName: true, id: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log("\n=== Users & connected accounts ===\n");
  for (const u of users) {
    console.log(u.email);
    if (u.accounts.length === 0) {
      console.log("  (no active accounts)");
    } else {
      for (const a of u.accounts) {
        console.log(`  - ${a.platform}: ${a.accountName} [${a.id}]`);
      }
    }
  }
}

main()
  .finally(() => prisma.$disconnect());
