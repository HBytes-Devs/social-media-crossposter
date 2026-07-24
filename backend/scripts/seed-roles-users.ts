/**
 * One-shot seed: Super Admin, Admin, User — password 123456789
 * Run: npx tsx scripts/seed-roles-users.ts
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PASSWORD = "123456789";

const users = [
  {
    email: "haseebcodejourney@gmail.com",
    name: "Haseeb Super Admin",
    role: "SUPER_ADMIN" as const,
  },
  {
    email: "admin@hawkbytes.com",
    name: "HawkBytes Admin",
    role: "ADMIN" as const,
  },
  {
    email: "user@hawkbytes.com",
    name: "Demo User",
    role: "USER" as const,
  },
];

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12);

  for (const u of users) {
    const row = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        name: u.name,
        password: hash,
        role: u.role,
      },
      update: {
        name: u.name,
        password: hash,
        role: u.role,
      },
      select: { id: true, email: true, role: true },
    });
    console.log("OK", row.role, row.email, row.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
