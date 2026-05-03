#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     BookFlow — إعداد تلقائي كامل    ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ─── 1. .env.local ────────────────────────────────────────────────────────────
echo "📝 [1/5] إنشاء ملف البيئة..."
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://neondb_owner:npg_AnmYeXSQa8D6@ep-spring-waterfall-alm0yfdv.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="bXVzdGJlMzJjaGFyc2xvbmdzZWNyZXRrZXkxMjM="
NEXTAUTH_URL="http://localhost:3000"
EOF
echo "   ✅ .env.local جاهز"

# ─── 2. npm install ───────────────────────────────────────────────────────────
echo ""
echo "📦 [2/5] تثبيت الحزم..."
npm install --silent
echo "   ✅ node_modules جاهز"

# ─── 3. prisma migrate ───────────────────────────────────────────────────────
echo ""
echo "🗄️  [3/5] إنشاء جداول قاعدة البيانات..."
npx prisma migrate dev --name init
echo "   ✅ الجداول جاهزة في Neon"

# ─── 4. prisma seed ───────────────────────────────────────────────────────────
echo ""
echo "🌱 [4/5] إضافة البيانات التجريبية..."
npx prisma db seed
echo "   ✅ البيانات التجريبية جاهزة"

# ─── 5. Done ─────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ المشروع جاهز! شغّل:  npm run dev                    ║"
echo "║                                                          ║"
echo "║  🌐 localhost:3000              Landing page             ║"
echo "║  📅 localhost:3000/book/ahmed-barber  صفحة حجز          ║"
echo "║  🔑 localhost:3000/login              لوحة التحكم        ║"
echo "║     demo@bookflow.app / password123                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
