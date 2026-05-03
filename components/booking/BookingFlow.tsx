"use client"

import { useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Service = { id: string; name: string; duration: number; price: string }

type Provider = {
  id: string
  name: string
  slug: string
  services: Service[]
}

type BookingForm = {
  customerName: string
  customerPhone: string
  notes: string
}

type Step = "service" | "slot" | "confirm" | "done"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSlot(slot: string) {
  const [h, m] = slot.split(":").map(Number)
  const period = h < 12 ? "ص" : "م"
  const hour   = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatDisplayDate(date: Date) {
  const today    = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = addDays(today, 1)
  if (isoDate(date) === isoDate(today))    return "اليوم"
  if (isoDate(date) === isoDate(tomorrow)) return "غدًا"
  return date.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "الخدمة" },
    { key: "slot",    label: "الموعد" },
    { key: "confirm", label: "التأكيد" },
  ]
  const order: Record<Step, number> = { service: 0, slot: 1, confirm: 2, done: 3 }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
      {steps.map((step, i) => {
        const done    = order[current] > order[step.key]
        const active  = current === step.key
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: done || active ? "var(--c-accent)" : "var(--c-border)",
                color: done || active ? "var(--c-bg)" : "var(--c-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, transition: "all 0.2s",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 12, fontWeight: active ? 600 : 400,
                color: active ? "var(--c-text)" : "var(--c-muted)",
              }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1.5, margin: "0 8px", marginBottom: 18,
                background: done ? "var(--c-accent)" : "var(--c-border)",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Pick service ─────────────────────────────────────────────────────

function ServiceStep({
  services,
  onSelect,
}: {
  services: Service[]
  onSelect: (s: Service) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  if (services.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--c-muted)" }}>
        لا توجد خدمات متاحة حاليًا
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--c-text)", marginBottom: 4 }}>
        اختر الخدمة
      </h2>
      <p style={{ fontSize: 14, color: "var(--c-muted)", marginBottom: 12 }}>
        {services.length} خدمة متاحة
      </p>
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelect(service)}
          onMouseEnter={() => setHovered(service.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: "100%", textAlign: "right", padding: "20px 24px",
            borderRadius: 12,
            border: `1.5px solid ${hovered === service.id ? "var(--c-accent)" : "var(--c-border)"}`,
            background: hovered === service.id ? "var(--c-hover)" : "var(--c-surface)",
            cursor: "pointer", transition: "all 0.15s",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--c-text)" }}>{service.name}</div>
            <div style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 4 }}>
              {service.duration} دقيقة
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)" }}>
            {service.price} <span style={{ fontSize: 13, fontWeight: 400 }}>ر.س</span>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Step 2: Pick slot ────────────────────────────────────────────────────────

function SlotStep({
  providerId,
  service,
  onSelect,
  onBack,
}: {
  providerId: string
  service: Service
  onSelect: (date: Date, slot: string) => void
  onBack: () => void
}) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [selectedDate, setSelectedDate] = useState(today)
  const [slots, setSlots]               = useState<string[] | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError]     = useState<string | null>(null)

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  async function selectDate(date: Date) {
    setSelectedDate(date)
    setSlots(null)
    setSlotsError(null)
    setLoadingSlots(true)
    try {
      const res = await fetch(
        `/api/schedule/${providerId}?date=${isoDate(date)}&serviceId=${service.id}`
      )
      const data = await res.json()
      if (!res.ok) { setSlotsError(data.error ?? "حدث خطأ"); return }
      setSlots(data.slots)
    } catch {
      setSlotsError("تعذّر تحميل المواعيد — حاول مرة أخرى")
    } finally {
      setLoadingSlots(false)
    }
  }

  // Load slots for today on mount
  useState(() => { selectDate(today) })

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-muted)", fontSize: 13, marginBottom: 20, padding: 0 }}>
        ← العودة
      </button>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--c-text)", marginBottom: 4 }}>
        اختر الموعد
      </h2>
      <p style={{ fontSize: 14, color: "var(--c-muted)", marginBottom: 20 }}>
        {service.name} · {service.duration} دقيقة
      </p>

      {/* Date picker strip */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24 }}>
        {days.map((day) => {
          const active = isoDate(day) === isoDate(selectedDate)
          return (
            <button
              key={isoDate(day)}
              onClick={() => selectDate(day)}
              style={{
                flexShrink: 0, padding: "10px 16px", borderRadius: 10, border: "1.5px solid",
                borderColor: active ? "var(--c-accent)" : "var(--c-border)",
                background: active ? "var(--c-accent)" : "transparent",
                color: active ? "var(--c-bg)" : "var(--c-text)",
                cursor: "pointer", transition: "all 0.15s",
                fontSize: 13, fontWeight: active ? 600 : 400,
              }}
            >
              <div>{formatDisplayDate(day) === "اليوم" ? "اليوم" : formatDisplayDate(day) === "غدًا" ? "غدًا" : day.toLocaleDateString("ar-SA", { weekday: "short" })}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{day.getDate()}</div>
            </button>
          )
        })}
      </div>

      {/* Date label */}
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)", marginBottom: 16 }}>
        {formatDisplayDate(selectedDate)}
      </div>

      {/* Slots grid */}
      {loadingSlots ? (
        <div style={{ padding: "32px 0", textAlign: "center", color: "var(--c-muted)", fontSize: 14 }}>
          جاري تحميل المواعيد...
        </div>
      ) : slotsError ? (
        <div style={{ padding: "24px 0", color: "var(--c-red)", fontSize: 14 }}>{slotsError}</div>
      ) : slots === null ? null : slots.length === 0 ? (
        <div style={{ padding: "32px 0", textAlign: "center", color: "var(--c-muted)", fontSize: 14 }}>
          لا مواعيد متاحة في هذا اليوم — جرّب يومًا آخر
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 10 }}>
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => onSelect(selectedDate, slot)}
              style={{
                padding: "12px 8px", borderRadius: 10, border: "1.5px solid var(--c-border)",
                background: "var(--c-surface)", color: "var(--c-text)",
                cursor: "pointer", transition: "all 0.15s",
                fontSize: 14, fontWeight: 600, textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--c-accent)"
                e.currentTarget.style.background  = "var(--c-accent)"
                e.currentTarget.style.color = "var(--c-bg)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--c-border)"
                e.currentTarget.style.background  = "var(--c-surface)"
                e.currentTarget.style.color = "var(--c-text)"
              }}
            >
              {formatSlot(slot)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Confirm ──────────────────────────────────────────────────────────

function ConfirmStep({
  providerId,
  service,
  date,
  slot,
  onBack,
  onDone,
}: {
  providerId: string
  service: Service
  date: Date
  slot: string
  onBack: () => void
  onDone: (name: string) => void
}) {
  const [form, setForm]         = useState<BookingForm>({ customerName: "", customerPhone: "", notes: "" })
  const [errors, setErrors]     = useState<Partial<BookingForm>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  function set(field: keyof BookingForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setServerError(null)
  }

  function validate(): boolean {
    const e: Partial<BookingForm> = {}
    if (!form.customerName.trim()) e.customerName = "الاسم مطلوب"
    if (!form.customerPhone.trim()) e.customerPhone = "رقم الهاتف مطلوب"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError(null)

    // Build startTime ISO string from date + slot
    const [hours, minutes] = slot.split(":").map(Number)
    const startTime = new Date(date)
    startTime.setHours(hours, minutes, 0, 0)

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          serviceId: service.id,
          customerName: form.customerName.trim(),
          customerPhone: form.customerPhone.trim(),
          startTime: startTime.toISOString(),
          notes: form.notes.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error ?? "حدث خطأ — حاول مرة أخرى")
        return
      }

      onDone(form.customerName.trim())
    } catch {
      setServerError("تعذّر الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1.5px solid var(--c-border)",
    background: "var(--c-surface)", color: "var(--c-text)",
    fontSize: 15, outline: "none", direction: "rtl",
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-muted)", fontSize: 13, marginBottom: 20, padding: 0 }}>
        ← العودة
      </button>

      {/* Booking summary card */}
      <div style={{
        background: "var(--c-bg)", border: "1px solid var(--c-border)",
        borderRadius: 12, padding: "16px 20px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 13, color: "var(--c-muted)", marginBottom: 8 }}>ملخص الحجز</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)" }}>{service.name}</div>
        <div style={{ fontSize: 14, color: "var(--c-muted)", marginTop: 4 }}>
          {formatDisplayDate(date)} · {formatSlot(slot)} · {service.duration} دقيقة
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginTop: 8 }}>
          {service.price} ر.س
        </div>
      </div>

      {serverError && (
        <div style={{
          background: "var(--c-red-bg)", color: "var(--c-red)",
          border: "1px solid var(--c-red)", borderRadius: 10,
          padding: "12px 16px", fontSize: 14, marginBottom: 20,
        }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>
              الاسم الكامل *
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => set("customerName", e.target.value)}
              placeholder="محمد أحمد"
              style={{ ...inputStyle, borderColor: errors.customerName ? "var(--c-red)" : "var(--c-border)" }}
            />
            {errors.customerName && <p style={{ fontSize: 12, color: "var(--c-red)", marginTop: 6 }}>{errors.customerName}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>
              رقم الهاتف *
            </label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => set("customerPhone", e.target.value)}
              placeholder="05xxxxxxxx"
              style={{ ...inputStyle, borderColor: errors.customerPhone ? "var(--c-red)" : "var(--c-border)" }}
              dir="ltr"
            />
            {errors.customerPhone && <p style={{ fontSize: 12, color: "var(--c-red)", marginTop: 6 }}>{errors.customerPhone}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>
              ملاحظات <span style={{ color: "var(--c-muted)", fontWeight: 400 }}>(اختياري)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="أي طلبات خاصة..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 10,
              background: "var(--c-accent)", color: "var(--c-bg)",
              border: "none", fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
            }}
          >
            {loading ? "جاري التأكيد..." : "تأكيد الحجز"}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Done screen ──────────────────────────────────────────────────────────────

function DoneScreen({ customerName, service, date, slot, providerName }: {
  customerName: string; service: Service; date: Date; slot: string; providerName: string
}) {
  return (
    <div style={{ textAlign: "center", padding: "24px 0 40px" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "var(--c-green-bg)", margin: "0 auto 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32,
      }}>
        ✓
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>
        تم الحجز بنجاح!
      </h2>
      <p style={{ fontSize: 15, color: "var(--c-muted)", lineHeight: 1.7 }}>
        أهلًا {customerName}، تم استلام حجزك لـ<br />
        <strong style={{ color: "var(--c-text)" }}>{service.name}</strong> مع {providerName}<br />
        {formatDisplayDate(date)} الساعة {formatSlot(slot)}
      </p>
      <p style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 20 }}>
        سيتواصل معك المزوّد لتأكيد الموعد
      </p>
    </div>
  )
}

// ─── Main Flow ────────────────────────────────────────────────────────────────

export default function BookingFlow({ provider }: { provider: Provider }) {
  const [step, setStep]             = useState<Step>("service")
  const [service, setService]       = useState<Service | null>(null)
  const [selectedDate, setDate]     = useState<Date | null>(null)
  const [selectedSlot, setSlot]     = useState<string | null>(null)
  const [customerName, setCustomer] = useState<string>("")

  return (
    <>
      

      <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
        {/* Header */}
        <div style={{
          background: "var(--c-surface)", borderBottom: "1px solid var(--c-border)",
          padding: "20px 24px", textAlign: "center",
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)" }}>
            احجز موعدًا مع {provider.name}
          </h1>
        </div>

        <main style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
          {step !== "done" && <StepBar current={step} />}

          {step === "service" && (
            <ServiceStep
              services={provider.services}
              onSelect={(s) => { setService(s); setStep("slot") }}
            />
          )}

          {step === "slot" && service && (
            <SlotStep
              providerId={provider.id}
              service={service}
              onBack={() => setStep("service")}
              onSelect={(d, s) => { setDate(d); setSlot(s); setStep("confirm") }}
            />
          )}

          {step === "confirm" && service && selectedDate && selectedSlot && (
            <ConfirmStep
              providerId={provider.id}
              service={service}
              date={selectedDate}
              slot={selectedSlot}
              onBack={() => setStep("slot")}
              onDone={(name) => { setCustomer(name); setStep("done") }}
            />
          )}

          {step === "done" && service && selectedDate && selectedSlot && (
            <DoneScreen
              customerName={customerName}
              service={service}
              date={selectedDate}
              slot={selectedSlot}
              providerName={provider.name}
            />
          )}
        </main>
      </div>
    </>
  )
}


