import Link from "next/link"

export default function NotFound() {
  return (
    <>
      
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:24, textAlign:"center" }}>
        <div style={{ fontSize:72, fontWeight:900, color:"#e5e2db", lineHeight:1 }}>404</div>
        <h1 style={{ fontSize:24, fontWeight:700, color:"#0f0e0c" }}>الصفحة غير موجودة</h1>
        <p style={{ fontSize:15, color:"#888580", maxWidth:320 }}>
          ربما تم حذف هذه الصفحة أو أن الرابط غير صحيح.
        </p>
        <Link href="/" style={{ marginTop:8, background:"#1a1916", color:"#fff", padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none" }}>
          العودة للرئيسية
        </Link>
      </div>
    </>
  )
}


