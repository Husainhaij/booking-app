import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { AppointmentStatus } from "@/lib/types"

const ALLOWED: Record<string, string[]> = {
  PENDING:   ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
}

const PatchSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
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

  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: "حالة غير صحيحة", details: parsed.error.flatten().fieldErrors }, { status: 400 })

  const { status: newStatus } = parsed.data

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    select: { id: true, providerId: true, status: true },
  })

  if (!appointment)
    return NextResponse.json({ error: "الموعد غير موجود" }, { status: 404 })
  if (appointment.providerId !== session.user.id)
    return NextResponse.json({ error: "غير مصرح — هذا الموعد لا يخصّك" }, { status: 403 })

  const allowed = ALLOWED[appointment.status] ?? []
  if (!allowed.includes(newStatus))
    return NextResponse.json({ error: `لا يمكن تغيير الحالة من "${appointment.status}" إلى "${newStatus}"` }, { status: 422 })

  try {
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: { status: newStatus },
      select: { id: true, status: true, startTime: true, endTime: true, customerName: true },
    })
    return NextResponse.json({ appointment: updated })
  } catch (error) {
    console.error("[PATCH /api/appointments/[id]]", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
