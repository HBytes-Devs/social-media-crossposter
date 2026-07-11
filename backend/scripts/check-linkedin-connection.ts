import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  try {
    const rows = await prisma.socialAccount.findMany({
      where: { platform: "LINKEDIN" },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { updatedAt: "desc" },
    });

    if (rows.length === 0) {
      console.log("NOT_CONNECTED");
      console.log("No LinkedIn account found in the database.");
      return;
    }

    for (const row of rows) {
      const expired = row.expiresAt ? row.expiresAt.getTime() < Date.now() : false;
      console.log("---");
      console.log("User:", row.user.email);
      console.log("Account name:", row.accountName ?? "(unknown)");
      console.log("Platform account ID:", row.accountId);
      console.log("Active:", row.isActive);
      console.log("Token expires:", row.expiresAt?.toISOString() ?? "no expiry set");
      console.log("Token status:", expired ? "EXPIRED" : "valid (or no expiry)");
      console.log("Scopes:", row.scopes.join(", ") || "(none)");
      console.log("Last updated:", row.updatedAt.toISOString());
      console.log(
        "Overall:",
        row.isActive && !expired ? "CONNECTED" : row.isActive ? "CONNECTED_BUT_EXPIRED" : "DISCONNECTED",
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("ERROR:", err instanceof Error ? err.message : err);
  process.exit(1);
});
