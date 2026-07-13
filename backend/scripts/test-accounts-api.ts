import "dotenv/config";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env.js";
import { prisma } from "../src/config/database.js";
import * as accountsService from "../src/services/accounts.service.js";

const EMAIL = "haseebcodejourney@gmail.com";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    console.log("USER_NOT_FOUND");
    process.exit(1);
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const accounts = await accountsService.listAccounts(user.id);
  console.log("User:", user.email);
  console.log("Accounts via service:", accounts.length);
  for (const a of accounts) {
    console.log(`  - ${a.platform}: ${a.accountName} (${a.id}) active=${a.isActive}`);
  }

  const res = await fetch("http://localhost:3001/api/v1/accounts", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  console.log("API status:", res.status);
  console.log("API accounts:", JSON.stringify(body, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
