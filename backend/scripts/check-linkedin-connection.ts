import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { isPlatformConfigured } from "../src/platforms/platform.config.js";

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("LinkedIn app configured:", isPlatformConfigured("LINKEDIN") ? "YES" : "NO");

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
      const logs = await prisma.publishLog.findMany({
        where: { socialAccountId: row.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { post: { select: { status: true } } },
      });

      console.log("---");
      console.log("User:", row.user.email);
      console.log("Account name:", row.accountName ?? "(unknown)");
      console.log("Platform account ID:", row.accountId);
      console.log("Active:", row.isActive);
      console.log("Refresh token stored:", Boolean(row.refreshToken));
      console.log("Token expires:", row.expiresAt?.toISOString() ?? "no expiry set");
      console.log("Token status:", expired ? "EXPIRED" : "valid (or no expiry)");
      console.log("Scopes:", row.scopes.join(", ") || "(none)");
      console.log("Last updated:", row.updatedAt.toISOString());
      console.log(
        "Overall:",
        row.isActive && !expired ? "CONNECTED" : row.isActive ? "CONNECTED_BUT_EXPIRED" : "DISCONNECTED",
      );

      if (logs.length > 0) {
        console.log("Recent publish attempts:");
        for (const log of logs) {
          console.log(
            `  ${log.createdAt.toISOString()} | ${log.status}${log.errorMessage ? ` — ${log.errorMessage}` : ""} | post: ${log.post.status}`,
          );
        }
      } else {
        console.log("Recent publish attempts: (none logged)");
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("ERROR:", err instanceof Error ? err.message : err);
  process.exit(1);
});
