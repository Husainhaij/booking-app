export default function BookingLoading() {
  const shimmer: React.CSSProperties = {
    background: "linear-gradient(90deg,#f0ede8 25%,#e8e5e0 50%,#f0ede8 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: 8,
  }
  return (
    <>
      
      <div style={{ minHeight:"100vh", background:"#f5f3ef" }}>
        <div style={{ background:"#fff", borderBottom:"1px solid #e5e2db", padding:"20px 24px", textAlign:"center" }}>
          <div style={{ ...shimmer, height:24, width:240, margin:"0 auto" }} />
        </div>
        <div style={{ maxWidth:480, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:40 }}>
            {[1,2,3].map(i => <div key={i} style={{ ...shimmer, width:70, height:36 }} />)}
          </div>
          <div style={{ ...shimmer, height:20, width:120, marginBottom:16 }} />
          {[1,2,3].map(i => (
            <div key={i} style={{ ...shimmer, height:80, marginBottom:12 }} />
          ))}
        </div>
      </div>
    </>
  )
}
