export default function DashboardLoading() {
  const shimmer: React.CSSProperties = {
    background: "linear-gradient(90deg, #f0ede8 25%, #e8e5e0 50%, #f0ede8 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: 8,
  }
  return (
    <>
      
      <div style={{ minHeight:"100vh", background:"#f5f3ef" }}>
        <div style={{ background:"#fff", height:60, borderBottom:"1px solid #e5e2db" }} />
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ ...shimmer, height:32, width:200, marginBottom:32 }} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:40 }}>
            {[1,2,3].map((i) => (
              <div key={i} style={{ background:"#fff", borderRadius:16, padding:28, border:"1px solid #e5e2db" }}>
                <div style={{ ...shimmer, height:14, width:80, marginBottom:12 }} />
                <div style={{ ...shimmer, height:42, width:60 }} />
              </div>
            ))}
          </div>
          <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e2db", overflow:"hidden" }}>
            {[1,2,3,4].map((i) => (
              <div key={i} style={{ padding:"18px 24px", borderBottom:"1px solid #e5e2db", display:"flex", gap:16, alignItems:"center" }}>
                <div style={{ ...shimmer, height:20, width:60 }} />
                <div style={{ flex:1 }}>
                  <div style={{ ...shimmer, height:16, width:"40%", marginBottom:8 }} />
                  <div style={{ ...shimmer, height:12, width:"60%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}


