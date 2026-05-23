import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  eventflowPrisma?: PrismaClient;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function isDatabaseRequired() {
  const flag = process.env.EVENTFLOW_REQUIRE_DATABASE?.trim().toLowerCase();
  return flag === "true" || flag === "1" || flag === "yes";
}

export function shouldUseMockFallback() {
  return !isDatabaseRequired();
}

export function getPrisma() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!globalForPrisma.eventflowPrisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    globalForPrisma.eventflowPrisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.eventflowPrisma;
}
