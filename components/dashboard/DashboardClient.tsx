"use client"

import { useState } from "react"
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
  providerName: string
  providerSlug: string
  appointments: Appointment[]
  stats: { todayCount: number; pendingCount: number; weekRevenue: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function formatDate(date: Date | string) {
  const d = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString())    return "اليوم"
  if (d.toDateString() === tomorrow.toDateString()) return "غدًا"

  return d.toLocaleDateString("ar-SA", { weekday: "short", month: "short", day: "numeric" })
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING:   "قيد الانتظار",
  CONFIRMED: "مؤكد",
  CANCELLED: "ملغي",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "var(--c-surface)",
      border: "1px solid var(--c-border)",
      borderRadius: 16,
      padding: "28px 32px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <span style={{ fontSize: 13, color: "var(--c-muted)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 42, fontWeight: 700, lineHeight: 1, color: "var(--c-text)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {sub && <span style={{ fontSize: 13, color: "var(--c-muted)" }}>{sub}</span>}
    </div>
  )
}

function AppointmentRow({
  appt,
  onStatusChange,
}: {
  appt: Appointment
  onStatusChange: (id: string, status: AppointmentStatus) => void
}) {
  const [loading, setLoading] = useState(false)

  async function updateStatus(newStatus: AppointmentStatus) {
    setLoading(true)
    try {
      await fetch(`/api/appointments/${appt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      onStatusChange(appt.id, newStatus)
    } finally {
      setLoading(false)
    }
  }

  const isPending = appt.status === "PENDING"

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "90px 1fr auto",
      gap: 16,
      alignItems: "center",
      padding: "18px 24px",
      borderBottom: "1px solid var(--c-border)",
      transition: "background 0.15s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--c-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Time block */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--c-text)", fontVariantNumeric: "tabular-nums" }}>
          {formatTime(appt.startTime)}
        </div>
        <div style={{ fontSize: 11, color: "var(--c-muted)", marginTop: 2 }}>
          {formatDate(appt.startTime)}
        </div>
      </div>

      {/* Info block */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text)" }}>{appt.customerName}</div>
        <div style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 2 }}>
          {appt.service.name} · {appt.service.duration} دقيقة · {appt.service.price} ر.س
        </div>
        {appt.notes && (
          <div style={{ fontSize: 12, color: "var(--c-muted)", marginTop: 4, fontStyle: "italic" }}>
            {appt.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 999,
          background: appt.status === "CONFIRMED" ? "var(--c-green-bg)" : appt.status === "PENDING" ? "var(--c-amber-bg)" : "var(--c-red-bg)",
          color:       appt.status === "CONFIRMED" ? "var(--c-green)"    : appt.status === "PENDING" ? "var(--c-amber)"    : "var(--c-red)",
        }}>
          {STATUS_LABELS[appt.status]}
        </span>

        {isPending && (
          <>
            <button
              onClick={() => updateStatus("CONFIRMED")}
              disabled={loading}
              style={{
                fontSize: 12, fontWeight: 600,
                padding: "5px 14px", borderRadius: 8,
                background: "var(--c-accent)", color: "#fff",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
              }}
            >
              تأكيد
            </button>
            <button
              onClick={() => updateStatus("CANCELLED")}
              disabled={loading}
              style={{
                fontSize: 12, fontWeight: 600,
                padding: "5px 14px", borderRadius: 8,
                background: "transparent", color: "var(--c-red)",
                border: "1px solid var(--c-red)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
              }}
            >
              إلغاء
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardClient({ providerName, providerSlug, appointments: initial, stats }: Props) {
  const [appointments, setAppointments] = useState(initial)

  function handleStatusChange(id: string, status: AppointmentStatus) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    )
  }

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${providerSlug}`

  return (
    <>
      

      <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>

        {/* Top Nav */}
        <nav style={{
          background: "var(--c-surface)",
          borderBottom: "1px solid var(--c-border)",
          padding: "0 32px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", letterSpacing: "-0.02em" }}>
              BookFlow
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { href: "/dashboard",          label: "الرئيسية" },
                { href: "/dashboard/calendar", label: "التقويم" },
                { href: "/dashboard/services", label: "الخدمات" },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{
                  fontSize: 13, fontWeight: 500, color: "var(--c-muted)",
                  padding: "6px 14px", borderRadius: 8, textDecoration: "none",
                  transition: "color 0.15s",
                }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--c-muted)" }}>{providerName}</span>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "var(--c-accent)", color: "var(--c-bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700,
            }}>
              {providerName.charAt(0)}
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--c-text)", letterSpacing: "-0.03em" }}>
                مرحبًا، {providerName.split(" ")[0]}
              </h1>
              <p style={{ fontSize: 14, color: "var(--c-muted)", marginTop: 4 }}>
                رابط حجزك العام:{" "}
                <a href={bookingUrl} target="_blank" rel="noopener"
                  style={{ color: "var(--c-accent)", fontWeight: 600, textDecoration: "none" }}>
                  /book/{providerSlug}
                </a>
              </p>
            </div>
            <Link href="/dashboard/services/new" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--c-accent)", color: "var(--c-bg)",
              padding: "10px 20px", borderRadius: 10,
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              + خدمة جديدة
            </Link>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
            <StatCard label="مواعيد اليوم"   value={stats.todayCount}               sub="حجز مؤكد ومنتظر" />
            <StatCard label="ينتظر التأكيد"  value={stats.pendingCount}              sub="اضغط تأكيد أو إلغاء" />
            <StatCard label="إيرادات الأسبوع" value={`${stats.weekRevenue.toFixed(0)} ر.س`} sub="من الحجوزات المؤكدة" />
          </div>

          {/* Upcoming appointments */}
          <div style={{
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: 16,
            overflow: "hidden",
          }}>
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--c-border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>المواعيد القادمة</h2>
              <Link href="/dashboard/calendar" style={{ fontSize: 13, color: "var(--c-muted)", textDecoration: "none", fontWeight: 500 }}>
                عرض التقويم ←
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
                <p style={{ color: "var(--c-muted)", fontSize: 14 }}>لا مواعيد قادمة</p>
                <p style={{ color: "var(--c-muted)", fontSize: 13, marginTop: 4 }}>
                  شارك رابط الحجز{" "}
                  <a href={bookingUrl} target="_blank" rel="noopener"
                    style={{ color: "var(--c-accent)", fontWeight: 600, textDecoration: "none" }}>
                    /book/{providerSlug}
                  </a>
                  {" "}مع عملائك
                </p>
              </div>
            ) : (
              appointments.map((appt) => (
                <AppointmentRow
                  key={appt.id}
                  appt={appt}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </>
  )
}
