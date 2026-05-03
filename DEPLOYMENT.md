# دليل النشر — BookFlow

## الخيارات المتاحة للـ Database

| | Neon | Railway |
|---|---|---|
| Free tier | 0.5 GB | 1 GB / $5 credit |
| Connection pooling | مدمج (PgBouncer) | يدوي |
| Vercel integration | بنقرة واحدة | يدوي |
| الأنسب لـ | Serverless / Vercel | تحكم كامل |

---

## الخيار أ — Neon + Vercel (الأسرع)

### 1. إنشاء قاعدة البيانات على Neon

1. افتح [neon.tech](https://neon.tech) وأنشئ حسابًا
2. أنشئ Project جديد → اختر region قريبة (Europe Frankfurt للسعودية)
3. انسخ **Connection String** من Dashboard:
   ```
   postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

### 2. رفع الكود على GitHub

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/booking-app.git
git push -u origin main
```

### 3. ربط Vercel

1. افتح [vercel.com](https://vercel.com) → New Project
2. Import من GitHub → اختر `booking-app`
3. **Framework Preset**: Next.js (يكتشفه تلقائيًا)
4. أضف Environment Variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | connection string من Neon |
| `NEXTAUTH_SECRET` | ناتج `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

5. اضغط **Deploy**

### 4. تشغيل الـ Migration على Neon

بعد النشر الأول، شغّل Prisma migrate محلياً مع DATABASE_URL الإنتاجي:

```bash
# في .env.local ضع connection string الإنتاجي مؤقتاً
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

أو استخدم Neon's SQL Editor مباشرة.

---

## الخيار ب — Railway

### 1. إنشاء Database على Railway

```bash
# تثبيت Railway CLI
npm install -g @railway/cli

# تسجيل الدخول
railway login

# إنشاء مشروع جديد
railway init

# إضافة PostgreSQL
railway add --plugin postgresql
```

أو من الـ Dashboard:
1. افتح [railway.app](https://railway.app) → New Project
2. Provision PostgreSQL
3. انسخ `DATABASE_URL` من Variables tab

### 2. النشر على Railway (كامل)

```bash
# ربط المشروع
railway link

# نشر التطبيق
railway up
```

### 3. إضافة متغيرات البيئة

في Railway Dashboard → Variables:
```
DATABASE_URL        = (موجود تلقائياً من PostgreSQL plugin)
NEXTAUTH_SECRET     = (openssl rand -base64 32)
NEXTAUTH_URL        = https://your-app.up.railway.app
```

---

## تشغيل الـ Migration (مشترك للخيارين)

```bash
# نسخ احتياطي أولاً (في الإنتاج دائماً)
# ثم:
npx prisma migrate deploy
```

> `migrate deploy` يطبّق migrations الجاهزة فقط — لا يُنشئ migration جديدة.
> استخدمه دائماً في الإنتاج. `migrate dev` للتطوير المحلي فقط.

---

## إنشاء أول مستخدم (Seed)

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await hash("password123", 12)

  await prisma.user.upsert({
    where: { email: "demo@bookflow.app" },
    update: {},
    create: {
      name:     "أحمد الحلاق",
      email:    "demo@bookflow.app",
      password,
      slug:     "ahmed-barber",
      services: {
        create: [
          { name: "قص شعر رجالي",   duration: 30, price: 50  },
          { name: "قص + لحية",      duration: 45, price: 80  },
          { name: "صبغة شعر كاملة", duration: 90, price: 150 },
        ],
      },
    },
  })

  console.log("✅ Seed complete — login: demo@bookflow.app / password123")
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

أضف في `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

شغّل:
```bash
npm install -D ts-node
npx prisma db seed
```

---

## Checklist النشر النهائي

```
□ DATABASE_URL  موجود في Vercel/Railway Environment Variables
□ NEXTAUTH_SECRET  طوله >= 32 حرف
□ NEXTAUTH_URL  يطابق domain الإنتاجي بالضبط (بدون slash في النهاية)
□ npx prisma migrate deploy  شُغّل بنجاح
□ npx prisma db seed  شُغّل لإنشاء أول مستخدم
□ تجربة /book/ahmed-barber  على الـ domain الإنتاجي
□ تسجيل دخول على /login  والتحقق من /dashboard
□ إنشاء حجز وهمي واختبار تأكيده من التقويم
```

---

## إعداد Connection Pooling (مهم في Serverless)

Vercel Functions تُنشئ connection جديد مع كل invocation. بدون pooling ستستنزف connections الـ DB بسرعة.

**مع Neon:** مدمج تلقائياً — لا شيء إضافي.

**مع Railway:** أضف PgBouncer أو استخدم Prisma Accelerate:

```bash
npm install @prisma/extension-accelerate
```

```typescript
// lib/prisma.ts — النسخة مع Accelerate
import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

export const prisma = new PrismaClient().$extends(withAccelerate())
```

```
# .env.local
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_KEY"
```

---

## Custom Domain

**Vercel:**
1. Settings → Domains → Add Domain
2. أضف DNS record كما يطلبه Vercel
3. غيّر `NEXTAUTH_URL` للـ domain الجديد وأعد النشر

**Railway:**
1. Service Settings → Networking → Custom Domain
2. نفس خطوات DNS

---

## المشاكل الشائعة

**`PrismaClientInitializationError`**
→ تحقق من أن `DATABASE_URL` صحيح وأن `?sslmode=require` موجود

**`NEXTAUTH_URL mismatch`**
→ يجب أن يطابق الـ URL الفعلي بالضبط بما فيه `https://`

**`Cannot find module '@prisma/client'`**
→ تأكد أن `build` script يحتوي `prisma generate && next build`

**الحجز يعطي 409 دائماً**
→ تحقق من timezone — `startTime` يجب أن يُرسل كـ UTC ISO string
