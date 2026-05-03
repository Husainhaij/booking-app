// ─── Types ────────────────────────────────────────────────────────────────────

export type TimeRange = {
  startTime: Date
  endTime: Date
}

export type WorkingHours = {
  startHour: number // 0-23, e.g. 9
  endHour: number   // 0-23, e.g. 18
}

// MVP default: 9am–6pm every day
export const DEFAULT_WORKING_HOURS: WorkingHours = {
  startHour: 9,
  endHour: 18,
}

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * Returns available HH:MM slot strings for a given day.
 *
 * Algorithm:
 *  1. Generate all possible slots (cursor += durationMinutes until workEnd)
 *  2. Remove any slot whose [start, end) overlaps an existing appointment
 *  3. Remove slots that start in the past (if date is today)
 *
 * This is a pure function — easy to unit-test without a DB.
 */
export function generateSlots(
  date: Date,
  durationMinutes: number,
  bookedRanges: TimeRange[],
  working: WorkingHours = DEFAULT_WORKING_HOURS
): string[] {
  const slots: string[] = []

  // Build day boundaries in local time
  const dayStart = new Date(date)
  dayStart.setHours(working.startHour, 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(working.endHour, 0, 0, 0)

  const now = new Date()

  const cursor = new Date(dayStart)

  while (cursor < dayEnd) {
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000)

    // Don't generate a slot that would run past the working day
    if (slotEnd > dayEnd) break

    // Skip slots that have already passed (for today)
    const alreadyPast = cursor <= now

    // Check overlap with any booked range:
    //   overlap exists when slot.start < booked.end AND slot.end > booked.start
    const isBooked = bookedRanges.some(
      (r) => cursor < r.endTime && slotEnd > r.startTime
    )

    if (!alreadyPast && !isBooked) {
      // Format as HH:MM
      const hh = cursor.getHours().toString().padStart(2, "0")
      const mm = cursor.getMinutes().toString().padStart(2, "0")
      slots.push(`${hh}:${mm}`)
    }

    cursor.setMinutes(cursor.getMinutes() + durationMinutes)
  }

  return slots
}

// ─── Helper: build day boundaries for a DB query ─────────────────────────────

export function dayBoundaries(dateStr: string): { gte: Date; lt: Date } {
  const base = new Date(dateStr)
  if (isNaN(base.getTime())) throw new Error(`Invalid date: ${dateStr}`)

  const gte = new Date(base)
  gte.setHours(0, 0, 0, 0)

  const lt = new Date(base)
  lt.setHours(23, 59, 59, 999)

  return { gte, lt }
}
