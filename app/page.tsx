import Link from "next/link"

export default function LandingPage() {
  return (
    <>
      

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="container">
          <div className="nav-inner">
            <div className="nav-logo">BookFlow</div>
            <div className="nav-links">
              <a href="#features" className="nav-link">المميزات</a>
              <a href="#how" className="nav-link">كيف يعمل</a>
              <a href="#for" className="nav-link">لمن هو</a>
              <Link href="/login" className="nav-link">تسجيل الدخول</Link>
            </div>
            <Link href="/register" className="nav-cta">ابدأ مجانًا</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span></span>
            متاح الآن — جرّب مجاناً
          </div>
          <h1 className="hero-h1">
            رابط حجز واحد<br />
            <em>يُدير مواعيدك كاملاً</em>
          </h1>
          <p className="hero-sub">
            منصة حجز ذكية لمزوّدي الخدمات — حلاقين، عيادات، مدرّبين.
            شارك رابطك، واستقبل الحجوزات تلقائياً بدون مكالمات.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn-primary">
              ابدأ مجانًا ←
            </Link>
            <Link href="/book/ahmed-barber" className="btn-secondary">
              شاهد مثالاً حياً
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ── */}
      <div className="proof">
        <div className="container">
          <div className="proof-inner">
            {[
              { num: "+500",  label: "مزوّد خدمة نشط" },
              { num: "+12K",  label: "حجز شهرياً" },
              { num: "0 ر.س", label: "رسوم تسجيل" },
              { num: "3 دقائق", label: "وقت الإعداد" },
            ].map((p) => (
              <div key={p.num} className="proof-item">
                <div className="proof-num">{p.num}</div>
                <div className="proof-label">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOCK BROWSER ── */}
      <div className="mockup-wrap">
        <div className="container">
          <div className="browser">
            <div className="browser-bar">
              <div className="dots">
                <div className="dot" style={{ background: "#ff5f57" }}></div>
                <div className="dot" style={{ background: "#febc2e" }}></div>
                <div className="dot" style={{ background: "#28c840" }}></div>
              </div>
              <div className="url-bar">bookflow.app/dashboard</div>
            </div>
            <div className="browser-body">
              <div className="mini-stats">
                {[
                  { val: "7",       label: "مواعيد اليوم" },
                  { val: "3",       label: "ينتظر التأكيد" },
                  { val: "1,240 ر.س", label: "إيرادات الأسبوع" },
                ].map((s) => (
                  <div key={s.label} className="mini-stat">
                    <div className="mini-stat-val">{s.val}</div>
                    <div className="mini-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mini-appts">
                {[
                  { time: "10:00 ص", name: "محمد العتيبي",  service: "قص شعر · 30 د",  status: "مؤكد",       sc: { bg:"#e6f4ec", c:"#1a7a42" } },
                  { time: "10:30 ص", name: "فهد الدوسري",   service: "قص + لحية · 45 د", status: "انتظار",    sc: { bg:"#fef3e2", c:"#92600a" } },
                  { time: "11:30 ص", name: "خالد الشمري",   service: "قص شعر · 30 د",  status: "مؤكد",       sc: { bg:"#e6f4ec", c:"#1a7a42" } },
                ].map((a) => (
                  <div key={a.name} className="mini-appt">
                    <div className="mini-appt-time">{a.time}</div>
                    <div className="mini-appt-info">
                      <div className="mini-appt-name">{a.name}</div>
                      <div className="mini-appt-service">{a.service}</div>
                    </div>
                    <div className="mini-chip" style={{ background: a.sc.bg, color: a.sc.c }}>
                      {a.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-label">المميزات</div>
          <h2 className="section-h2">كل ما تحتاجه في مكان واحد</h2>
          <p className="section-sub">
            بدون تعقيدات — فقط رابط تشاركه وتبدأ في استقبال الحجوزات فوراً.
          </p>
          <div className="features-grid">
            {[
              {
                icon: "🔗", bg: "#f0f4ff", title: "رابط حجز شخصي",
                desc: "رابط فريد لك مثل bookflow.app/اسمك — شاركه عبر واتساب أو إنستغرام أو بطاقة العمل.",
              },
              {
                icon: "🚫", bg: "#fff0f0", title: "لا ازدواجية في المواعيد",
                desc: "نظام قفل ذكي على مستوى قاعدة البيانات يمنع حجز نفس الوقت مرتين — حتى في حالة الطلبات المتزامنة.",
              },
              {
                icon: "📅", bg: "#f0fdf4", title: "تقويم تفاعلي",
                desc: "عرض شهري واضح لكل مواعيدك مع إمكانية التأكيد والإلغاء بنقرة واحدة.",
              },
              {
                icon: "⚡", bg: "#fffbf0", title: "بدون تسجيل للعميل",
                desc: "عميلك يختار الخدمة والوقت ويؤكد — كل هذا بدون إنشاء حساب أو تحميل تطبيق.",
              },
              {
                icon: "📊", bg: "#f5f0ff", title: "إحصائيات فورية",
                desc: "مواعيد اليوم، الطلبات المعلقة، وإيرادات الأسبوع — كلها في لوحة تحكم واحدة.",
              },
              {
                icon: "🛠️", bg: "#fff4f0", title: "خدمات مرنة",
                desc: "أضف خدماتك بمدد وأسعار مختلفة — كل خدمة تُحسب مواعيدها المتاحة تلقائياً.",
              },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                <h3 className="feature-h3">{f.title}</h3>
                <p className="feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how" id="how">
        <div className="container">
          <div className="section-label" style={{ textAlign: "center" }}>كيف يعمل</div>
          <h2 className="section-h2" style={{ textAlign: "center" }}>جاهز في 3 دقائق</h2>
          <div className="steps">
            {[
              { n: "1", title: "أنشئ حسابك",       desc: "سجّل باسمك وبريدك واختر رابطًا فريدًا يمثّل نشاطك." },
              { n: "2", title: "أضف خدماتك",        desc: "حدّد اسم كل خدمة ومدّتها وسعرها — يمكنك إضافة عدد غير محدود." },
              { n: "3", title: "شارك رابطك",        desc: "ارسل الرابط عبر أي قناة — واتساب، إنستغرام، أو ضعه في bio." },
              { n: "4", title: "استقبل الحجوزات",   desc: "تصلك الحجوزات تلقائياً وتؤكدها بنقرة من لوحة التحكم." },
            ].map((s) => (
              <div key={s.n} className="step">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section className="for" id="for">
        <div className="container">
          <div className="section-label">لمن هو</div>
          <h2 className="section-h2">مناسب لكل مزوّد خدمة</h2>
          <div className="for-grid">
            {[
              { e: "✂️",  title: "حلاقون ومصففو شعر", desc: "إدارة جدول يومي بدون مكالمات" },
              { e: "🏥",  title: "عيادات ومراكز طبية", desc: "حجوزات منظّمة للاستشارات" },
              { e: "💪",  title: "مدرّبون شخصيون",     desc: "جلسات تدريب بدون تعارض في المواعيد" },
              { e: "💆",  title: "مراكز تجميل وسبا",   desc: "خدمات متعددة في رابط واحد" },
              { e: "📸",  title: "مصوّرون فوتوغرافيون", desc: "حجز جلسات التصوير بسهولة" },
              { e: "🎓",  title: "معلمون ومدرّسون",     desc: "جدولة الدروس الخصوصية تلقائياً" },
            ].map((c) => (
              <div key={c.title} className="for-card">
                <div className="for-emoji">{c.e}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-h2">ابدأ باستقبال حجوزاتك<br />اليوم — مجاناً</h2>
          <p className="cta-sub">بدون بطاقة ائتمان. بدون إعداد معقّد.</p>
          <div className="cta-actions">
            <Link href="/register" className="btn-white">إنشاء حساب مجاني ←</Link>
            <Link href="/login" className="btn-ghost">تسجيل الدخول</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="container">
          <div className="footer">
            <div className="footer-logo">BookFlow</div>
            <div className="footer-copy">© {new Date().getFullYear()} BookFlow — جميع الحقوق محفوظة</div>
          </div>
        </div>
      </footer>
    </>
  )
}


