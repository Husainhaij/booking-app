import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { AppointmentStatus, isPrismaError } from "@/lib/types"

// ─── GET /api/appointments?start=ISO&end=ISO ──────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }
  const { searchParams } = req.nextUrl
  const start = searchParams.get("start")
  const end   = searchParams.get("end")
  if (!start || !end)
    return NextResponse.json({ error: "start و end مطلوبان" }, { status: 400 })

  const startDate = new Date(start)
  const endDate   = new Date(end)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
    return NextResponse.json({ error: "تواريخ غير صحيحة" }, { status: 400 })

  try {
    const appointments = await prisma.appointment.findMany({
      where: { providerId: session.user.id, startTime: { gte: startDate, lte: endDate } },
      include: { service: { select: { name: true, duration: true, price: true } } },
      orderBy: { startTime: "asc" },
    })
    const serialized = appointments.map((a: { service: { price: { toString(): string } }, [key: string]: unknown }) => ({
      ...a,
      service: { ...a.service, price: a.service.price.toString() },
    }))
    return NextResponse.json({ appointments: serialized })
  } catch (error) {
    console.error("[GET /api/appointments]", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

const BookSchema = z.object({
  providerId:    z.string().cuid("providerId غير صحيح"),
  serviceId:     z.string().cuid("serviceId غير صحيح"),
  customerName:  z.string().min(2, "الاسم قصير").max(100).trim(),
  customerPhone: z.string().regex(/^[0-9+\s\-()]{7,20}$/, "رقم الهاتف غير صحيح").trim(),
  startTime:     z.string().datetime({ message: "صيغة الوقت غير صحيحة" }),
  notes:         z.string().max(500).optional(),
})

class SlotConflictError extends Error {
  constructor() { super("TIME_SLOT_TAKEN"); this.name = "SlotConflictError" }
}

// ─── POST /api/appointments ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "صيغة الطلب غير صحيحة" }, { status: 400 }) }

  const parsed = BookSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.flatten().fieldErrors }, { status: 400 })

  const { providerId, serviceId, customerName, customerPhone, startTime, notes } = parsed.data

  const [provider, service] = await Promise.all([
    prisma.user.findUnique({ where: { id: providerId }, select: { id: true } }),
    prisma.service.findUnique({ where: { id: serviceId }, select: { id: true, duration: true, isActive: true, providerId: true } }),
  ])

  if (!provider)               return NextResponse.json({ error: "المزوّد غير موجود" }, { status: 404 })
  if (!service || !service.isActive) return NextResponse.json({ error: "الخدمة غير موجودة أو غير نشطة" }, { status: 404 })
  if (service.providerId !== providerId) return NextResponse.json({ error: "الخدمة لا تنتمي لهذا المزوّد" }, { status: 400 })

  const start = new Date(startTime)
  const end   = new Date(start.getTime() + service.duration * 60_000)

  if (start < new Date())
    return NextResponse.json({ error: "لا يمكن الحجز في وقت ماضٍ" }, { status: 400 })

  try {
    const appointment = await prisma.$transaction(async (tx: any) => {
      type Row = { id: string }
      const conflicts = await tx.$queryRaw<Row[]>`
        SELECT id FROM "Appointment"
        WHERE "providerId" = ${providerId}
          AND status != 'CANCELLED'
          AND "startTime" < ${end}
          AND "endTime"   > ${start}
        FOR UPDATE
      `
      if (conflicts.length > 0) throw new SlotConflictError()
      return tx.appointment.create({
        data: { providerId, serviceId, customerName, customerPhone, startTime: start, endTime: end, notes: notes ?? null },
        select: { id: true, providerId: true, serviceId: true, customerName: true, customerPhone: true, startTime: true, endTime: true, status: true, notes: true, createdAt: true },
      })
    })
    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    if (error instanceof SlotConflictError)
      return NextResponse.json({ error: "هذا الوقت محجوز بالفعل — يرجى اختيار وقت آخر" }, { status: 409 })
    if (isPrismaError(error)) {
      console.error("[POST /api/appointments] Prisma:", error.code)
      return NextResponse.json({ error: "خطأ في قاعدة البيانات" }, { status: 500 })
    }
    console.error("[POST /api/appointments]", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
