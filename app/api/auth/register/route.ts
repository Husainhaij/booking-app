import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { isPrismaError, PRISMA_UNIQUE_VIOLATION } from "@/lib/types"

const RegisterSchema = z.object({
  name:     z.string().min(2, "الاسم قصير جدًا").max(60).trim(),
  email:    z.string().email("بريد إلكتروني غير صحيح").toLowerCase().trim(),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  slug:     z
    .string()
    .min(3, "الرابط قصير جدًا")
    .max(40, "الرابط طويل جدًا")
    .regex(/^[a-z0-9-]+$/, "الرابط يقبل فقط: أحرف صغيرة وأرقام وشرطة -")
    .trim(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "صيغة الطلب غير صحيحة" }, { status: 400 }) }

  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.flatten().fieldErrors }, { status: 400 })

  const { name, email, password, slug } = parsed.data
  const hashedPassword = await hash(password, 12)

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, slug },
      select: { id: true, name: true, email: true, slug: true },
    })
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (isPrismaError(error) && error.code === PRISMA_UNIQUE_VIOLATION) {
      const targets = error.meta?.target ?? []
      const field = targets.includes("email") ? "email" : "slug"
      return NextResponse.json(
        { error: field === "email" ? "هذا البريد الإلكتروني مسجّل بالفعل" : "هذا الرابط مأخوذ — جرّب رابطًا آخر", field },
        { status: 409 }
      )
    }
    console.error("[POST /api/auth/register]", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
