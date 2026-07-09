import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.warn("⚠️  Database connection failed — server will run without DB.");
    console.warn("   Set DATABASE_URL in .env when PostgreSQL is ready.");
    if (error instanceof Error) {
      console.warn(`   Reason: ${error.message}`);
    }
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
