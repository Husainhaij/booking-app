"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Global Error]", error)
  }, [error])

  return (
    <>
      
      <html lang="ar" dir="rtl">
        <body>
          <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:24, textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:8 }}>⚠️</div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#0f0e0c" }}>حدث خطأ غير متوقع</h1>
            <p style={{ fontSize:14, color:"#888580", maxWidth:320, lineHeight:1.7 }}>
              نأسف على ذلك. يمكنك المحاولة مجدداً أو العودة للرئيسية.
            </p>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button onClick={reset} style={{ background:"#1a1916", color:"#fff", padding:"11px 24px", borderRadius:10, fontSize:14, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                حاول مجدداً
              </button>
              <Link href="/" style={{ background:"transparent", color:"#888580", padding:"11px 24px", borderRadius:10, fontSize:14, fontWeight:500, border:"1px solid #e5e2db" }}>
                الرئيسية
              </Link>
            </div>
          </div>
        </body>
      </html>
    </>
  )
}


