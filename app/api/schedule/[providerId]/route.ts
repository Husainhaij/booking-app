import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSlots, dayBoundaries } from "@/lib/slots"

export async function GET(
  req: NextRequest,
  { params }: { params: { providerId: string } }
) {
  const { searchParams } = req.nextUrl
  const dateStr   = searchParams.get("date")
  const serviceId = searchParams.get("serviceId")

  if (!dateStr || !serviceId)
    return NextResponse.json({ error: "date و serviceId مطلوبان" }, { status: 400 })

  const dateObj = new Date(dateStr)
  if (isNaN(dateObj.getTime()))
    return NextResponse.json({ error: "صيغة التاريخ غير صحيحة — YYYY-MM-DD" }, { status: 400 })

  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 60)
  if (dateObj > maxDate)
    return NextResponse.json({ error: "لا يمكن الحجز أكثر من 60 يومًا مقدمًا" }, { status: 400 })

  const [provider, service] = await Promise.all([
    prisma.user.findUnique({ where: { id: params.providerId }, select: { id: true } }),
    prisma.service.findUnique({ where: { id: serviceId }, select: { id: true, duration: true, isActive: true, providerId: true } }),
  ])

  if (!provider)
    return NextResponse.json({ error: "المزوّد غير موجود" }, { status: 404 })
  if (!service || !service.isActive)
    return NextResponse.json({ error: "الخدمة غير موجودة أو غير نشطة" }, { status: 404 })
  if (service.providerId !== params.providerId)
    return NextResponse.json({ error: "الخدمة لا تنتمي لهذا المزوّد" }, { status: 400 })

  let boundaries: { gte: Date; lt: Date }
  try { boundaries = dayBoundaries(dateStr) }
  catch { return NextResponse.json({ error: "تاريخ غير صحيح" }, { status: 400 }) }

  const booked = await prisma.appointment.findMany({
    where: {
      providerId: params.providerId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startTime: { gte: boundaries.gte, lte: boundaries.lt },
    },
    select: { startTime: true, endTime: true },
  })

  const slots = generateSlots(dateObj, service.duration, booked)
  return NextResponse.json({ slots, date: dateStr, serviceId, total: slots.length })
}
