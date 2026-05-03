// Shared enums matching the Prisma schema exactly.
// We define them here instead of relying on @prisma/client export
// so they work before `prisma generate` runs and in all environments.

export enum AppointmentStatus {
  PENDING   = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export enum Role {
  PROVIDER = "PROVIDER",
}

// Prisma P2002 = unique constraint violation
export const PRISMA_UNIQUE_VIOLATION = "P2002"

// Type guard for Prisma errors
export function isPrismaError(e: unknown): e is { code: string; meta?: { target?: string[] } } {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    typeof (e as { code: unknown }).code === "string"
  )
}
