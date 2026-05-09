import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppointmentStatus } from "@/lib/types"
import CalendarClient from "@/components/dashboard/CalendarClient"

async function getMonthAppointments(providerId: string, year: number, month: number) {
  const start = new Date(year, month, 1)
  const end   = new Date(year, month + 1, 0, 23, 59, 59)

  const appointments = await prisma.appointment.findMany({
    where: {
      providerId,
      startTime: { gte: start, lte: end },
      status: { not: AppointmentStatus.CANCELLED },
    },
    include: { service: { select: { name: true, duration: true, price: true } } },
    orderBy: { startTime: "asc" },
  })

  type RawAppt = (typeof appointments)[number]
  return appointments.map((a: RawAppt) => ({
    id: a.id,
    customerName: a.customerName,
    customerPhone: a.customerPhone,
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status as unknown as AppointmentStatus,
    notes: a.notes,
    service: { name: a.service.name, duration: a.service.duration, price: a.service.price.toString() },
  }))
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()

  const appointments = await getMonthAppointments(session.user.id, year, month)

  return (
    <CalendarClient
      appointments={appointments}
      initialYear={year}
      initialMonth={month}
      providerId={session.user.id}
    />
  )
}
 
