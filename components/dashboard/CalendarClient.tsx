"use client"

import { useState, useCallback } from "react"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED"

type Appointment = {
  id: string
  customerName: string
  customerPhone: string
  startTime: Date | string
  endTime: Date | string
  status: AppointmentStatus
  notes: string | null
  service: { name: string; duration: number; price: string }
}

type Props = {
  appointments: Appointment[]
  initialYear: number
  initialMonth: number
  providerId: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ARABIC_MONTHS = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
]

const ARABIC_DAYS_SHORT = ["أح","إث","ثل","أر","خم","جم","سب"]

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function toDate(d: Date | string) {
  return typeof d === "string" ? new Date(d) : d
}

function formatTime(d: Date | string) {
  return toDate(d).toLocaleTimeString("ar-SA", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  })
}

// Group appointments by YYYY-MM-DD
function groupByDate(appointments: Appointment[]): Record<string, Appointment[]> {
  const map: Record<string, Appointment[]> = {}
  for (const a of appointments) {
    const key = isoDate(toDate(a.startTime))
    if (!map[key]) map[key] = []
    map[key].push(a)
  }
  return map
}

// Build calendar grid: array of 6 weeks × 7 days
function buildCalendarGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)

  // Sunday = 0 in JS; we want Saturday-aligned grid for Arabic (Sat–Fri)
  // We'll keep Sunday-start (simple, works for both)
  let startOffset = firstDay.getDay() // 0=Sun

  const weeks: (Date | null)[][] = []
  let week: (Date | null)[] = Array(startOffset).fill(null)

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d))
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  return weeks
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_META: Record<AppointmentStatus, { label: string; bg: string; color: string; dot: string }> = {
  PENDING:   { label: "انتظار", bg: "var(--c-amber-bg)", color: "var(--c-amber)", dot: "#f59e0b" },
  CONFIRMED: { label: "مؤكد",   bg: "var(--c-green-bg)", color: "var(--c-green)", dot: "#22c55e" },
  CANCELLED: { label: "ملغي",   bg: "var(--c-red-bg)",   color: "var(--c-red)",   dot: "#ef4444" },
}

// ─── Day detail panel ─────────────────────────────────────────────────────────

function DayPanel({
  date,
  appointments,
  onClose,
  onStatusChange,
}: {
  date: Date
  appointments: Appointment[]
  onClose: () => void
  onStatusChange: (id: string, status: AppointmentStatus) => void
}) {
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(id: string, status: AppointmentStatus) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) onStatusChange(id, status)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }}
      />

      {/* Panel */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 420,
        height: "85vh",
        background: "var(--c-surface)",
        borderRadius: "20px 20px 0 0",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        animation: "slideUp 0.25s ease",
      }}>
        

        {/* Panel header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--c-border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--c-text)" }}>
              {date.getDate()} {ARABIC_MONTHS[date.getMonth()]}
            </div>
            <div style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 2 }}>
              {appointments.length} موعد
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "var(--c-bg)", border: "none", borderRadius: "50%",
            width: 36, height: 36, cursor: "pointer", fontSize: 18,
            color: "var(--c-muted)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            ×
          </button>
        </div>

        {/* Appointment list */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 0" }}>
          {appointments.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--c-muted)", fontSize: 14 }}>
              لا مواعيد في هذا اليوم
            </div>
          ) : (
            appointments.map((appt) => {
              const meta = STATUS_META[appt.status]
              const isPending = appt.status === "PENDING"
              const isUpdating = updating === appt.id
              return (
                <div key={appt.id} style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--c-border)",
                }}>
                  {/* Time + status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", fontVariantNumeric: "tabular-nums" }}>
                      {formatTime(appt.startTime)} — {formatTime(appt.endTime)}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                      background: meta.bg, color: meta.color,
                    }}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Customer + service */}
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text)" }}>
                    {appt.customerName}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 2 }}>
                    {appt.service.name} · {appt.service.price} ر.س
                  </div>
                  <div style={{ fontSize: 12, color: "var(--c-muted)", marginTop: 2 }}>
                    📞 {appt.customerPhone}
                  </div>
                  {appt.notes && (
                    <div style={{ fontSize: 12, color: "var(--c-muted)", marginTop: 4, fontStyle: "italic" }}>
                      {appt.notes}
                    </div>
                  )}

                  {/* Actions */}
                  {isPending && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => updateStatus(appt.id, "CONFIRMED")}
                        disabled={isUpdating}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 8,
                          background: "var(--c-accent)", color: "var(--c-bg)",
                          border: "none", fontSize: 13, fontWeight: 600,
                          cursor: isUpdating ? "not-allowed" : "pointer",
                          opacity: isUpdating ? 0.6 : 1,
                        }}
                      >
                        {isUpdating ? "..." : "تأكيد"}
                      </button>
                      <button
                        onClick={() => updateStatus(appt.id, "CANCELLED")}
                        disabled={isUpdating}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 8,
                          background: "transparent", color: "var(--c-red)",
                          border: "1px solid var(--c-red)", fontSize: 13, fontWeight: 600,
                          cursor: isUpdating ? "not-allowed" : "pointer",
                          opacity: isUpdating ? 0.6 : 1,
                        }}
                      >
                        {isUpdating ? "..." : "إلغاء"}
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CalendarClient({
  appointments: initialAppts,
  initialYear,
  initialMonth,
  providerId,
}: Props) {
  const [year, setYear]         = useState(initialYear)
  const [month, setMonth]       = useState(initialMonth)
  const [appointments, setAppts] = useState(initialAppts)
  const [loading, setLoading]   = useState(false)
  const [selectedDate, setSelected] = useState<Date | null>(null)

  const byDate = groupByDate(appointments)
  const grid   = buildCalendarGrid(year, month)
  const today  = new Date()

  // ── Navigate month ──────────────────────────────────────────────────────────
  async function navigate(dir: -1 | 1) {
    let newMonth = month + dir
    let newYear  = year
    if (newMonth < 0)  { newMonth = 11; newYear-- }
    if (newMonth > 11) { newMonth = 0;  newYear++ }

    setLoading(true)
    setMonth(newMonth)
    setYear(newYear)
    setSelected(null)

    try {
      const start = new Date(newYear, newMonth, 1).toISOString()
      const end   = new Date(newYear, newMonth + 1, 0, 23, 59, 59).toISOString()
      const res   = await fetch(
        `/api/appointments?providerId=${providerId}&start=${start}&end=${end}`
      )
      if (res.ok) {
        const data = await res.json()
        setAppts(data.appointments ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = useCallback((id: string, status: AppointmentStatus) => {
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }, [])

  // ── Dot indicators (max 3 dots per day) ─────────────────────────────────────
  function DayDots({ dateKey }: { dateKey: string }) {
    const appts = byDate[dateKey] ?? []
    if (appts.length === 0) return null
    const shown = appts.slice(0, 3)
    return (
      <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 4 }}>
        {shown.map((a, i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: "50%",
            background: STATUS_META[a.status].dot,
          }} />
        ))}
        {appts.length > 3 && (
          <span style={{ fontSize: 8, color: "var(--c-muted)", lineHeight: "5px" }}>+</span>
        )}
      </div>
    )
  }

  const panelAppts = selectedDate
    ? (byDate[isoDate(selectedDate)] ?? []).sort(
        (a, b) => toDate(a.startTime).getTime() - toDate(b.startTime).getTime()
      )
    : []

  return (
    <>
      

      <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>

        {/* Nav */}
        <nav style={{
          background: "var(--c-surface)", borderBottom: "1px solid var(--c-border)",
          padding: "0 32px", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>BookFlow</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { href: "/dashboard",          label: "الرئيسية" },
                { href: "/dashboard/calendar", label: "التقويم" },
                { href: "/dashboard/services", label: "الخدمات" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{
                  fontSize: 13, fontWeight: 500, color: "var(--c-muted)",
                  padding: "6px 14px", borderRadius: 8, textDecoration: "none",
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

          {/* Month navigation */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 28,
          }}>
            <button onClick={() => navigate(-1)} style={{
              background: "var(--c-surface)", border: "1px solid var(--c-border)",
              borderRadius: 10, width: 40, height: 40, cursor: "pointer",
              fontSize: 18, color: "var(--c-text)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              ›
            </button>

            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text)", letterSpacing: "-0.02em" }}>
                {loading ? "..." : `${ARABIC_MONTHS[month]} ${year}`}
              </h1>
              <p style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 2 }}>
                {appointments.length} موعد هذا الشهر
              </p>
            </div>

            <button onClick={() => navigate(1)} style={{
              background: "var(--c-surface)", border: "1px solid var(--c-border)",
              borderRadius: 10, width: 40, height: 40, cursor: "pointer",
              fontSize: 18, color: "var(--c-text)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              ‹
            </button>
          </div>

          {/* Calendar grid */}
          <div style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, overflow: "hidden",
            opacity: loading ? 0.6 : 1, transition: "opacity 0.2s",
          }}>
            {/* Day headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: "1px solid var(--c-border)",
            }}>
              {ARABIC_DAYS_SHORT.map((d) => (
                <div key={d} style={{
                  padding: "12px 0", textAlign: "center",
                  fontSize: 12, fontWeight: 600, color: "var(--c-muted)",
                  letterSpacing: "0.04em",
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, wi) => (
              <div key={wi} style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                borderBottom: wi < grid.length - 1 ? "1px solid var(--c-border)" : "none",
              }}>
                {week.map((day, di) => {
                  if (!day) return (
                    <div key={`empty-${di}`} style={{ minHeight: 80, background: "var(--c-bg)", opacity: 0.4 }} />
                  )

                  const key       = isoDate(day)
                  const isToday   = isoDate(day) === isoDate(today)
                  const isSelected = selectedDate && isoDate(day) === isoDate(selectedDate)
                  const count     = (byDate[key] ?? []).length

                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(isSelected ? null : day)}
                      style={{
                        minHeight: 80, padding: "10px 8px",
                        border: "none",
                        borderRight: di < 6 ? "1px solid var(--c-border)" : "none",
                        background: isSelected
                          ? "var(--c-accent)"
                          : count > 0 ? "var(--c-hover)" : "var(--c-surface)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "background 0.15s",
                        display: "flex", flexDirection: "column", alignItems: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "var(--c-hover)"
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = count > 0 ? "var(--c-hover)" : "var(--c-surface)"
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: isToday ? 700 : 400,
                        background: isToday && !isSelected ? "var(--c-accent)" : "transparent",
                        color: isSelected
                          ? "var(--c-bg)"
                          : isToday ? "var(--c-bg)" : "var(--c-text)",
                      }}>
                        {day.getDate()}
                      </div>

                      {count > 0 && !isSelected && <DayDots dateKey={key} />}

                      {count > 0 && (
                        <div style={{
                          fontSize: 10, marginTop: 4,
                          color: isSelected ? "var(--c-bg)" : "var(--c-muted)",
                          opacity: 0.8,
                        }}>
                          {count}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginTop: 20, justifyContent: "center" }}>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: meta.dot }} />
                <span style={{ fontSize: 12, color: "var(--c-muted)" }}>{meta.label}</span>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Day detail panel */}
      {selectedDate && (
        <DayPanel
          date={selectedDate}
          appointments={panelAppts}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  )
}
