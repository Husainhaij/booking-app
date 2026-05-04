import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma" import { AppointmentStatus } from "@/lib/types" import { AppointmentStatus } from "@/lib/types" import { AppointmentStatus } from "@/lib/types" import { AppointmentStatus } from "@/lib/types" import { AppointmentStatus } from "@/lib/types" import { AppointmentStatus } from "@/lib/types" import { AppointmentStatus } from "@/lib/types" import { AppointmentStatus } from "@/lib/types"
import DashboardClient from "@/components/dashboard/DashboardClient"

async function getDashboardData(providerId: string) {
  const now       = new Date()
  const todayStart = new Date(now); todayStart.setHours(0,  0,  0, 0)
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  const weekEnd    = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [upcoming, todayCount, pendingCount, weekAppts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        providerId,
        startTime: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: { service: { select: { name: true, duration: true, price: true } } },
      orderBy: { startTime: "asc" },
      take: 10,
    }),
    prisma.appointment.count({
      where: { providerId, startTime: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.appointment.count({
      where: { providerId, status: "PENDING" },
    }),
    prisma.appointment.findMany({
      where: { providerId, startTime: { gte: todayStart, lte: weekEnd }, status: "CONFIRMED" },
      include: { service: { select: { price: true } } },
    }),
  ])

  const weekRevenue = weekAppts.reduce(
    (sum: number, a: { service: { price: { toString: () => string } } }) => sum + Number(a.service.price.toString()),
    0
  )

  return {
    upcomingAppointments: (upcoming as Array<typeof upcoming[number] & { service: { name: string; duration: number; price: { toString(): string } } }>).map((a) => ({
      ...a,
      service: { ...a.service, price: a.service.price.toString() },
    })),
    stats: { todayCount, pendingCount, weekRevenue },
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const { upcomingAppointments, stats } = await getDashboardData(session.user.id)

  return (
    <DashboardClient
      providerName={session.user.name}
      providerSlug={session.user.slug}
      appointments={upcomingAppointments}
      stats={stats}
    />
  )
}


