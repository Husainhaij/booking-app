import Link from "next/link"

export default function BookingNotFound() {
  return (
    <>
      
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, padding:24, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:8 }}>🔍</div>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#0f0e0c" }}>هذا الرابط غير موجود</h1>
        <p style={{ fontSize:14, color:"#888580", maxWidth:300, lineHeight:1.7 }}>
          تأكد من الرابط الذي وصلك — ربما يكون فيه خطأ إملائي.
        </p>
        <Link href="/" style={{ marginTop:12, background:"#1a1916", color:"#fff", padding:"11px 24px", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none" }}>
          الرئيسية
        </Link>
      </div>
    </>
  )
}
