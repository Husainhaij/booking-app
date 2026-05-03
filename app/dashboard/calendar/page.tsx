import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CalendarClient from "@/components/dashboard/CalendarClient"

async function getMonthAppointments(providerId: string, year: number, month: number) {
  const start = new Date(year, month, 1)
  const end   = new Date(year, month + 1, 0, 23, 59, 59)

  const appointments = await prisma.appointment.findMany({
    where: {
      providerId,
      startTime: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    include: { service: { select: { name: true, duration: true, price: true } } },
    orderBy: { startTime: "asc" },
  })

  type ApptWithService = Awaited<ReturnType<typeof prisma.appointment.findMany>>[number] & { service: { name: string; duration: number; price: { toString(): string } } }
  return (appointments as ApptWithService[]).map((a) => ({
    ...a,
    service: { ...a.service, price: a.service.price.toString() },
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


