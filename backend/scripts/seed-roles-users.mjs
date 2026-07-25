/**
 * One-shot seed: Super Admin, Admin, User — password 123456789
 * Works in production Docker image (no tsx required).
 * Run: node scripts/seed-roles-users.mjs
 * Or:  npx tsx scripts/seed-roles-users.ts
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PASSWORD = "123456789";

const users = [
  {
    email: "haseebcodejourney@gmail.com",
    name: "Haseeb Super Admin",
    role: "SUPER_ADMIN",
  },
  {
    email: "admin@hawkbytes.com",
    name: "HawkBytes Admin",
    role: "ADMIN",
  },
  {
    email: "user@hawkbytes.com",
    name: "Demo User",
    role: "USER",
  },
];

const hash = await bcrypt.hash(PASSWORD, 12);

for (const u of users) {
  const row = await prisma.user.upsert({
    where: { email: u.email },
    create: {
      email: u.email,
      name: u.name,
      password: hash,
      role: u.role,
      subscriptionTier: "PREMIUM",
      subscriptionStatus: "ACTIVE",
    },
    update: {
      name: u.name,
      password: hash,
      role: u.role,
      subscriptionTier: "PREMIUM",
      subscriptionStatus: "ACTIVE",
    },
    select: {
      id: true,
      email: true,
      role: true,
      subscriptionTier: true,
    },
  });
  console.log("OK", row.role, row.email, row.subscriptionTier, row.id);
}

await prisma.$disconnect();
