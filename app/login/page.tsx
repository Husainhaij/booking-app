"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    border: "1.5px solid var(--c-border)",
    background: "var(--c-surface)", color: "var(--c-text)",
    fontSize: 15, outline: "none", direction: "ltr",
    transition: "border-color 0.15s",
  }

  return (
    <>
      

      <div style={{
        minHeight: "100vh", background: "var(--c-bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--c-text)", letterSpacing: "-0.03em" }}>
              BookFlow
            </div>
            <p style={{ fontSize: 14, color: "var(--c-muted)", marginTop: 6 }}>
              سجّل دخولك للوصول إلى لوحة التحكم
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            borderRadius: 16, padding: "32px 28px",
          }}>
            {error && (
              <div style={{
                background: "var(--c-red-bg)", color: "var(--c-red)",
                border: "1px solid var(--c-red)", borderRadius: 10,
                padding: "12px 16px", fontSize: 14, marginBottom: 24,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={inputStyle}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={inputStyle}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "13px 0", borderRadius: 10,
                    background: "var(--c-accent)", color: "var(--c-bg)",
                    border: "none", fontSize: 15, fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
                    marginTop: 4,
                  }}
                >
                  {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}


