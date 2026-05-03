import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ServicesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const services = await prisma.service.findMany({
    where: { providerId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <>
      
      <div style={{ minHeight:"100vh", background:"var(--c-bg)" }}>
        <nav style={{ background:"var(--c-surface)", borderBottom:"1px solid var(--c-border)", padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
          <div style={{ display:"flex", alignItems:"center", gap:32 }}>
            <span style={{ fontSize:16, fontWeight:700, color:"var(--c-text)" }}>BookFlow</span>
            <div style={{ display:"flex", gap:4 }}>
              {([{href:"/dashboard",label:"الرئيسية"},{href:"/dashboard/calendar",label:"التقويم"},{href:"/dashboard/services",label:"الخدمات"}] as {href:string;label:string}[]).map((l) => (
                <Link key={l.href} href={l.href} style={{ fontSize:13, fontWeight:500, color:"var(--c-muted)", padding:"6px 14px", borderRadius:8 }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </nav>
        <main style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:700, color:"var(--c-text)", letterSpacing:"-0.03em" }}>الخدمات</h1>
              <p style={{ fontSize:14, color:"var(--c-muted)", marginTop:4 }}>{services.length} خدمة مضافة</p>
            </div>
            <Link href="/dashboard/services/new" style={{ background:"var(--c-accent)", color:"var(--c-bg)", padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:700 }}>
              + خدمة جديدة
            </Link>
          </div>
          <div style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:16, overflow:"hidden" }}>
            {services.length === 0 ? (
              <div style={{ padding:"60px 24px", textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:12 }}>✂️</div>
                <p style={{ color:"var(--c-muted)", fontSize:14, marginBottom:16 }}>لم تضف أي خدمة بعد</p>
                <Link href="/dashboard/services/new" style={{ background:"var(--c-accent)", color:"var(--c-bg)", padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:700, display:"inline-block" }}>
                  إضافة أول خدمة
                </Link>
              </div>
            ) : (
              services.map((s: { id: string; name: string; duration: number; price: { toString(): string }; isActive: boolean }, i: number) => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom: i < services.length-1 ? "1px solid var(--c-border)" : "none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background: s.isActive ? "var(--c-green)" : "var(--c-border)", flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:15, fontWeight:600, color:"var(--c-text)" }}>{s.name}</div>
                      <div style={{ fontSize:13, color:"var(--c-muted)", marginTop:2 }}>
                        {s.duration} دقيقة · {s.price.toString()} ر.س
                        {!s.isActive && <span style={{ marginRight:8, fontSize:11, color:"var(--c-red)" }}>• مخفية</span>}
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/services/${s.id}/edit`} style={{ fontSize:13, color:"var(--c-muted)", padding:"6px 14px", border:"1px solid var(--c-border)", borderRadius:8, fontWeight:500 }}>
                    تعديل
                  </Link>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  )
}


