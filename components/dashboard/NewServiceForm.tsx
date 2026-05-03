"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type FormState = {
  name: string
  duration: string
  price: string
  isActive: boolean
}

type FieldErrors = Partial<Record<keyof FormState, string[]>>

const DURATION_PRESETS = [
  { label: "15 د", value: 15 },
  { label: "30 د", value: 30 },
  { label: "45 د", value: 45 },
  { label: "60 د", value: 60 },
  { label: "90 د", value: 90 },
  { label: "120 د", value: 120 },
]

export default function NewServiceForm() {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    name: "", duration: "30", price: "", isActive: true,
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set(field: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setServerError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setServerError(null)

    const body = {
      name:     form.name.trim(),
      duration: parseInt(form.duration, 10),
      price:    parseFloat(form.price),
      isActive: form.isActive,
    }

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details) { setErrors(data.details); return }
        setServerError(data.error ?? "حدث خطأ غير متوقع")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/dashboard/services"), 1200)
    } catch {
      setServerError("تعذّر الاتصال بالخادم — تحقق من اتصالك")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: 10,
    border: `1.5px solid ${hasError ? "var(--c-red)" : "var(--c-border)"}`,
    background: "var(--c-surface)",
    color: "var(--c-text)",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.15s",
    direction: "rtl",
  })

  return (
    <>
      

      <div style={{ minHeight: "100vh", background: "var(--c-bg)", display: "flex", flexDirection: "column" }}>

        {/* Nav */}
        <nav style={{
          background: "var(--c-surface)", borderBottom: "1px solid var(--c-border)",
          padding: "0 32px", height: 60, display: "flex", alignItems: "center", gap: 12,
        }}>
          <Link href="/dashboard" style={{ fontSize: 14, color: "var(--c-muted)", textDecoration: "none" }}>
            لوحة التحكم
          </Link>
          <span style={{ color: "var(--c-border)" }}>/</span>
          <Link href="/dashboard/services" style={{ fontSize: 14, color: "var(--c-muted)", textDecoration: "none" }}>
            الخدمات
          </Link>
          <span style={{ color: "var(--c-border)" }}>/</span>
          <span style={{ fontSize: 14, color: "var(--c-text)", fontWeight: 500 }}>خدمة جديدة</span>
        </nav>

        <main style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "60px 24px" }}>
          <div style={{ width: "100%", maxWidth: 520 }}>

            {/* Title */}
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--c-text)", letterSpacing: "-0.03em", marginBottom: 8 }}>
              إضافة خدمة جديدة
            </h1>
            <p style={{ fontSize: 14, color: "var(--c-muted)", marginBottom: 36 }}>
              ستظهر هذه الخدمة في صفحة حجزك العامة فور الحفظ.
            </p>

            {/* Success banner */}
            {success && (
              <div style={{
                background: "var(--c-green-bg)", color: "var(--c-green)",
                border: "1px solid var(--c-green)",
                borderRadius: 10, padding: "12px 16px",
                fontSize: 14, fontWeight: 500, marginBottom: 24,
              }}>
                ✓ تم حفظ الخدمة بنجاح — جاري التحويل...
              </div>
            )}

            {/* Server error banner */}
            {serverError && (
              <div style={{
                background: "var(--c-red-bg)", color: "var(--c-red)",
                border: "1px solid var(--c-red)",
                borderRadius: 10, padding: "12px 16px",
                fontSize: 14, marginBottom: 24,
              }}>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Service name */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>
                    اسم الخدمة *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="مثال: قص شعر رجالي"
                    style={inputStyle(!!errors.name)}
                    required
                  />
                  {errors.name && (
                    <p style={{ fontSize: 12, color: "var(--c-red)", marginTop: 6 }}>{errors.name[0]}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>
                    مدة الخدمة *
                  </label>
                  {/* Quick presets */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {DURATION_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => set("duration", String(p.value))}
                        style={{
                          padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                          border: "1.5px solid",
                          borderColor: form.duration === String(p.value) ? "var(--c-accent)" : "var(--c-border)",
                          background: form.duration === String(p.value) ? "var(--c-accent)" : "transparent",
                          color: form.duration === String(p.value) ? "var(--c-bg)" : "var(--c-muted)",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="number"
                      value={form.duration}
                      onChange={(e) => set("duration", e.target.value)}
                      min={5} max={480}
                      style={{ ...inputStyle(!!errors.duration), width: 110 }}
                    />
                    <span style={{ fontSize: 14, color: "var(--c-muted)" }}>دقيقة</span>
                  </div>
                  {errors.duration && (
                    <p style={{ fontSize: 12, color: "var(--c-red)", marginTop: 6 }}>{errors.duration[0]}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>
                    السعر *
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      placeholder="0.00"
                      min={0} step={0.01}
                      style={{ ...inputStyle(!!errors.price), paddingLeft: 48 }}
                    />
                    <span style={{
                      position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                      fontSize: 13, color: "var(--c-muted)", fontWeight: 500, pointerEvents: "none",
                    }}>
                      ر.س
                    </span>
                  </div>
                  {errors.price && (
                    <p style={{ fontSize: 12, color: "var(--c-red)", marginTop: 6 }}>{errors.price[0]}</p>
                  )}
                </div>

                {/* Active toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--c-bg)", borderRadius: 10, border: "1px solid var(--c-border)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)" }}>الخدمة نشطة</div>
                    <div style={{ fontSize: 12, color: "var(--c-muted)", marginTop: 2 }}>
                      {form.isActive ? "تظهر في صفحة الحجز العامة" : "مخفية من صفحة الحجز"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("isActive", !form.isActive)}
                    role="switch"
                    aria-checked={form.isActive}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: form.isActive ? "var(--c-accent)" : "var(--c-border)",
                      border: "none", cursor: "pointer",
                      position: "relative", transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: "absolute", top: 2,
                      left: form.isActive ? 22 : 2,
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </button>
                </div>

                {/* Submit */}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={loading || success}
                    style={{
                      flex: 1, padding: "13px 0", borderRadius: 10,
                      background: "var(--c-accent)", color: "var(--c-bg)",
                      border: "none", fontSize: 15, fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
                    }}
                  >
                    {loading ? "جاري الحفظ..." : "حفظ الخدمة"}
                  </button>
                  <Link href="/dashboard/services" style={{
                    padding: "13px 20px", borderRadius: 10,
                    border: "1.5px solid var(--c-border)", color: "var(--c-muted)",
                    fontSize: 15, fontWeight: 500, textDecoration: "none",
                    display: "flex", alignItems: "center",
                  }}>
                    إلغاء
                  </Link>
                </div>

              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}


