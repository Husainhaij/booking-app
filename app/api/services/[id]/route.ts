import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const UpdateSchema = z.object({
  name:     z.string().min(2).max(100).trim().optional(),
  duration: z.number().int().min(5).max(480).optional(),
  price:    z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "صيغة الطلب غير صحيحة" }, { status: 400 }) }

  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.flatten().fieldErrors }, { status: 400 })

  const service = await prisma.service.findUnique({
    where: { id: params.id },
    select: { providerId: true },
  })

  if (!service)
    return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 })
  if (service.providerId !== session.user.id)
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })

  try {
    const updated = await prisma.service.update({
      where: { id: params.id },
      data: parsed.data,
      select: { id: true, name: true, duration: true, price: true, isActive: true },
    })
    return NextResponse.json({ service: { ...updated, price: updated.price.toString() } })
  } catch (error) {
    console.error("[PATCH /api/services/[id]]", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

  const service = await prisma.service.findUnique({
    where: { id: params.id },
    select: { providerId: true },
  })

  if (!service)
    return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 })
  if (service.providerId !== session.user.id)
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })

  // Soft delete — just deactivate, keep historical appointments intact
  await prisma.service.update({
    where: { id: params.id },
    data: { isActive: false },
  })

  return NextResponse.json({ ok: true })
}
