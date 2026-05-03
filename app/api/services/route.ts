import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const CreateServiceSchema = z.object({
  name:     z.string().min(2, "اسم الخدمة قصير جدًا").max(100).trim(),
  duration: z.number().int().min(5, "أقل مدة 5 دقائق").max(480, "أقصى مدة 8 ساعات"),
  price:    z.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
  isActive: z.boolean().optional().default(true),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const activeOnly = searchParams.get("activeOnly") === "true"

  try {
    const services = await prisma.service.findMany({
      where: { providerId: session.user.id, ...(activeOnly && { isActive: true }) },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, duration: true, price: true, isActive: true, createdAt: true },
    })
    const serialized = services.map((s: { id: string; name: string; duration: number; price: { toString: () => string }; isActive: boolean; createdAt: Date }) => ({
      ...s, price: s.price.toString(),
    }))
    return NextResponse.json({ services: serialized })
  } catch (error) {
    console.error("[GET /api/services]", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "صيغة الطلب غير صحيحة" }, { status: 400 }) }

  const parsed = CreateServiceSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.flatten().fieldErrors }, { status: 400 })

  const { name, duration, price, isActive } = parsed.data

  try {
    const service = await prisma.service.create({
      data: { name, duration, price, isActive, providerId: session.user.id },
      select: { id: true, name: true, duration: true, price: true, isActive: true, providerId: true, createdAt: true },
    })
    return NextResponse.json({ service: { ...service, price: service.price.toString() } }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/services]", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
