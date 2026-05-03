"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, textAlign:"center", padding:24 }}>
      <div style={{ fontSize:40 }}>⚠️</div>
      <h2 style={{ fontSize:18, fontWeight:700, color:"var(--c-text, #0f0e0c)" }}>حدث خطأ في تحميل البيانات</h2>
      <p style={{ fontSize:14, color:"var(--c-muted, #888580)", maxWidth:300 }}>
        {error.message ?? "خطأ غير متوقع — تحقق من اتصالك بالإنترنت."}
      </p>
      <button
        onClick={reset}
        style={{ marginTop:8, background:"#1a1916", color:"#fff", padding:"10px 24px", borderRadius:10, fontSize:14, fontWeight:600, border:"none", cursor:"pointer", fontFamily:"inherit" }}
      >
        إعادة المحاولة
      </button>
    </div>
  )
}


