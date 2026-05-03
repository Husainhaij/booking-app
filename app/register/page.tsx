"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type FieldErrors = Partial<Record<"name"|"email"|"password"|"slug", string[]>>

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", slug: "" })
  const [errors, setErrors]       = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setServerError(null)
    // Auto-generate slug from name
    if (field === "name" && !form.slug) {
      const auto = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 40)
      setForm((f) => ({ ...f, name: value, slug: auto }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setServerError(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.details) { setErrors(data.details); return }
        if (data.field)   { setErrors({ [data.field]: [data.error] }); return }
        setServerError(data.error ?? "حدث خطأ غير متوقع")
        return
      }

      // Auto sign in after successful registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (result?.ok) { router.push("/dashboard"); router.refresh() }
      else setServerError("تم إنشاء الحساب — يرجى تسجيل الدخول يدوياً")
    } catch {
      setServerError("تعذّر الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const inp = (hasErr?: boolean): React.CSSProperties => ({
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: `1.5px solid ${hasErr ? "var(--c-red)" : "var(--c-border)"}`,
    background: "var(--c-surface)", color: "var(--c-text)",
    fontSize: 15, outline: "none", direction: "rtl",
    transition: "border-color .15s",
    fontFamily: "inherit",
  })

  return (
    <>
      

      <div style={{ minHeight:"100vh", background:"var(--c-bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ width:"100%", maxWidth:460 }}>

          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <Link href="/" style={{ fontSize:24, fontWeight:900, color:"var(--c-text)", letterSpacing:"-0.04em" }}>
              BookFlow
            </Link>
            <p style={{ fontSize:14, color:"var(--c-muted)", marginTop:6 }}>
              أنشئ حسابك وابدأ في استقبال الحجوزات
            </p>
          </div>

          <div style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:16, padding:"32px 28px" }}>

            {serverError && (
              <div style={{ background:"var(--c-red-bg)", color:"var(--c-red)", border:"1px solid var(--c-red)", borderRadius:10, padding:"12px 16px", fontSize:14, marginBottom:24 }}>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                {/* Name */}
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--c-text)", marginBottom:8 }}>الاسم الكامل *</label>
                  <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                    placeholder="أحمد محمد" style={inp(!!errors.name)} />
                  {errors.name && <p style={{ fontSize:12, color:"var(--c-red)", marginTop:6 }}>{errors.name[0]}</p>}
                </div>

                {/* Email */}
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--c-text)", marginBottom:8 }}>البريد الإلكتروني *</label>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                    placeholder="name@example.com" style={{ ...inp(!!errors.email), direction:"ltr" }} autoComplete="email" />
                  {errors.email && <p style={{ fontSize:12, color:"var(--c-red)", marginTop:6 }}>{errors.email[0]}</p>}
                </div>

                {/* Password */}
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--c-text)", marginBottom:8 }}>كلمة المرور *</label>
                  <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                    placeholder="8 أحرف على الأقل" style={{ ...inp(!!errors.password), direction:"ltr" }} autoComplete="new-password" />
                  {errors.password && <p style={{ fontSize:12, color:"var(--c-red)", marginTop:6 }}>{errors.password[0]}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"var(--c-text)", marginBottom:8 }}>
                    رابط حجزك العام *
                  </label>
                  <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${errors.slug ? "var(--c-red)" : "var(--c-border)"}`, borderRadius:10, overflow:"hidden", background:"var(--c-surface)" }}>
                    <span style={{ padding:"12px 12px", fontSize:13, color:"var(--c-muted)", background:"var(--c-bg)", borderLeft:"1px solid var(--c-border)", whiteSpace:"nowrap" }}>
                      bookflow.app/
                    </span>
                    <input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}
                      placeholder="ahmed-barber"
                      style={{ flex:1, padding:"12px 12px", border:"none", background:"transparent", color:"var(--c-text)", fontSize:14, outline:"none", direction:"ltr", fontFamily:"monospace" }} />
                  </div>
                  {errors.slug
                    ? <p style={{ fontSize:12, color:"var(--c-red)", marginTop:6 }}>{errors.slug[0]}</p>
                    : form.slug && <p style={{ fontSize:12, color:"var(--c-green)", marginTop:6 }}>رابطك: bookflow.app/{form.slug}</p>
                  }
                </div>

                <button type="submit" disabled={loading} style={{
                  width:"100%", padding:"13px 0", borderRadius:10,
                  background:"var(--c-accent)", color:"var(--c-bg)",
                  border:"none", fontSize:15, fontWeight:700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1, marginTop:4,
                  fontFamily:"inherit",
                }}>
                  {loading ? "جاري الإنشاء..." : "إنشاء الحساب →"}
                </button>
              </div>
            </form>

            <p style={{ textAlign:"center", fontSize:13, color:"var(--c-muted)", marginTop:20 }}>
              لديك حساب بالفعل؟{" "}
              <Link href="/login" style={{ color:"var(--c-accent)", fontWeight:600 }}>
                سجّل دخولك
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}


