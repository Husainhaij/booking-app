import { PrismaClient } from "@prisma/client"

// In development, Next.js hot-reload creates a new module instance on every
// file change. Without this singleton pattern, each reload would open a new
// PrismaClient (and a new connection pool), quickly exhausting the DB limit.
//
// In production this module is loaded once, so globalThis assignment is a
// no-op — but it doesn't hurt to keep it consistent.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
