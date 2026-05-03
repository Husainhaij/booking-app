"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Service = { id: string; name: string; duration: number; price: string; isActive: boolean }
type FieldErrors = Partial<Record<"name" | "duration" | "price", string[]>>

const DURATION_PRESETS = [
  { label: "15 د", value: 15 }, { label: "30 د", value: 30 },
  { label: "45 د", value: 45 }, { label: "60 د", value: 60 },
  { label: "90 د", value: 90 }, { label: "120 د", value: 120 },
]

export default function EditServiceForm({ service }: { service: Service }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: service.name,
    duration: String(service.duration),
    price: service.price,
    isActive: service.isActive,
  })
  const [errors, setErrors]         = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [success, setSuccess]       = useState(false)

  function set(field: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setServerError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     form.name.trim(),
          duration: parseInt(form.duration, 10),
          price:    parseFloat(form.price),
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) { if (data.details) { setErrors(data.details); return } setServerError(data.error); return }
      setSuccess(true)
      setTimeout(() => router.push("/dashboard/services"), 1200)
    } catch { setServerError("تعذّر الاتصال بالخادم") }
    finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!confirm("هل أنت متأكد من إخفاء هذه الخدمة؟")) return
    setDeleting(true)
    try {
      await fetch(`/api/services/${service.id}`, { method: "DELETE" })
      router.push("/dashboard/services")
    } catch { setServerError("تعذّر الحذف") }
    finally { setDeleting(false) }
  }

  const inp = (hasErr?: boolean): React.CSSProperties => ({
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: `1.5px solid ${hasErr ? "var(--c-red)" : "var(--c-border)"}`,
    background: "var(--c-surface)", color: "var(--c-text)", fontSize: 15,
    outline: "none", direction: "rtl", transition: "border-color .15s", fontFamily: "inherit",
  })

  return (
    <>
      
      <div style={{ minHeight:"100vh", background:"var(--c-bg)", display:"flex", flexDirection:"column" }}>
        <nav style={{ background:"var(--c-surface)", borderBottom:"1px solid var(--c-border)", padding:"0 32px", height:60, display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard" style={{ fontSize:14, color:"var(--c-muted)" }}>لوحة التحكم</Link>
          <span style={{ color:"var(--c-border)" }}>/</span>
          <Link href="/dashboard/services" style={{ fontSize:14, color:"var(--c-muted)" }}>الخدمات</Link>
          <span style={{ color:"var(--c-border)" }}>/</span>
          <span style={{ fontSize:14, color:"var(--c-text)", fontWeight:500 }}>تعديل</span>
        </nav>
        <main style={{ flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"60px 24px" }}>
          <div style={{ width:"100%", maxWidth:520 }}>
            <h1 style={{ fontSize:26, fontWeight:700, color:"var(--c-text)", letterSpacing:"-0.03em", marginBottom:8 }}>تعديل الخدمة</h1>
            <p style={{ fontSize:14, color:"var(--c-muted)", marginBottom:36 }}>أي تغيير يُطبَّق فورًا على صفحة الحجز.</p>

            {success && <div style={{ background:"var(--c-green-bg)", color:"var(--c-green)", border:"1px solid var(--c-green)", borderRadius:10, padding:"12px 16px", fontSize:14, marginBottom:24 }}>✓ تم الحفظ — جاري التحويل...</div>}
            {serverError && <div style={{ background:"var(--c-red-bg)", color:"var(--c-red)", border:"1px solid var(--c-red)", borderRadius:10, padding:"12px 16px", fontSize:14, marginBottom:24 }}>{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--c-text)", marginBottom:8 }}>اسم الخدمة *</label>
                  <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} style={inp(!!errors.name)} />
                  {errors.name && <p style={{ fontSize:12, color:"var(--c-red)", marginTop:6 }}>{errors.name[0]}</p>}
                </div>
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--c-text)", marginBottom:8 }}>مدة الخدمة *</label>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                    {DURATION_PRESETS.map((p) => (
                      <button key={p.value} type="button" onClick={() => set("duration", String(p.value))} style={{ padding:"6px 14px", borderRadius:8, fontSize:13, fontWeight:500, border:"1.5px solid", borderColor: form.duration===String(p.value) ? "var(--c-accent)" : "var(--c-border)", background: form.duration===String(p.value) ? "var(--c-accent)" : "transparent", color: form.duration===String(p.value) ? "var(--c-bg)" : "var(--c-muted)", cursor:"pointer" }}>{p.label}</button>
                    ))}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <input type="number" value={form.duration} onChange={(e) => set("duration", e.target.value)} min={5} max={480} style={{ ...inp(!!errors.duration), width:110 }} />
                    <span style={{ fontSize:14, color:"var(--c-muted)" }}>دقيقة</span>
                  </div>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--c-text)", marginBottom:8 }}>السعر *</label>
                  <div style={{ position:"relative" }}>
                    <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} min={0} step={0.01} style={{ ...inp(!!errors.price), paddingLeft:48 }} />
                    <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"var(--c-muted)", pointerEvents:"none" }}>ر.س</span>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", background:"var(--c-bg)", borderRadius:10, border:"1px solid var(--c-border)" }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--c-text)" }}>الخدمة نشطة</div>
                    <div style={{ fontSize:12, color:"var(--c-muted)", marginTop:2 }}>{form.isActive ? "تظهر في صفحة الحجز" : "مخفية"}</div>
                  </div>
                  <button type="button" onClick={() => set("isActive", !form.isActive)} style={{ width:44, height:24, borderRadius:12, background: form.isActive ? "var(--c-accent)" : "var(--c-border)", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                    <span style={{ position:"absolute", top:2, left: form.isActive ? 22 : 2, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
                  </button>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  <button type="submit" disabled={loading||success} style={{ flex:1, padding:"13px 0", borderRadius:10, background:"var(--c-accent)", color:"var(--c-bg)", border:"none", fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily:"inherit" }}>
                    {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                  <Link href="/dashboard/services" style={{ padding:"13px 20px", borderRadius:10, border:"1.5px solid var(--c-border)", color:"var(--c-muted)", fontSize:15, fontWeight:500, display:"flex", alignItems:"center" }}>إلغاء</Link>
                </div>
                <button type="button" onClick={handleDelete} disabled={deleting} style={{ width:"100%", padding:"11px 0", borderRadius:10, background:"transparent", color:"var(--c-red)", border:"1px solid var(--c-red)", fontSize:14, fontWeight:500, cursor: deleting ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
                  {deleting ? "جاري الحذف..." : "إخفاء الخدمة"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}


