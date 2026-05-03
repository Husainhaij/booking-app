import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await hash("password123", 12)

  const provider = await prisma.user.upsert({
    where: { email: "demo@bookflow.app" },
    update: {},
    create: {
      name:     "أحمد الحلاق",
      email:    "demo@bookflow.app",
      password,
      slug:     "ahmed-barber",
      services: {
        create: [
          { name: "قص شعر رجالي",    duration: 30, price: 50,  isActive: true },
          { name: "قص + لحية",        duration: 45, price: 80,  isActive: true },
          { name: "صبغة شعر كاملة",  duration: 90, price: 150, isActive: true },
          { name: "حلاقة أطفال",      duration: 20, price: 35,  isActive: true },
        ],
      },
    },
    include: { services: true },
  })

  // Add a few demo appointments for today and tomorrow
  const today    = new Date(); today.setHours(10, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const service  = provider.services[0]

  await prisma.appointment.createMany({
    skipDuplicates: true,
    data: [
      {
        providerId: provider.id, serviceId: service.id,
        customerName: "محمد العتيبي", customerPhone: "0501234567",
        startTime: new Date(today.getTime() + 0 * 60 * 60_000),
        endTime:   new Date(today.getTime() + 0 * 60 * 60_000 + 30 * 60_000),
        status: "CONFIRMED",
      },
      {
        providerId: provider.id, serviceId: service.id,
        customerName: "فهد الدوسري", customerPhone: "0507654321",
        startTime: new Date(today.getTime() + 1 * 60 * 60_000),
        endTime:   new Date(today.getTime() + 1 * 60 * 60_000 + 30 * 60_000),
        status: "PENDING",
      },
      {
        providerId: provider.id, serviceId: provider.services[1].id,
        customerName: "خالد الشمري", customerPhone: "0509876543",
        startTime: new Date(tomorrow.getTime() + 2 * 60 * 60_000),
        endTime:   new Date(tomorrow.getTime() + 2 * 60 * 60_000 + 45 * 60_000),
        status: "PENDING",
      },
    ],
  })

  console.log(`
✅ Seed complete!

🔑 Login credentials:
   Email:    demo@bookflow.app
   Password: password123

🔗 Public booking page:
   http://localhost:3000/book/ahmed-barber

📊 Dashboard:
   http://localhost:3000/dashboard
  `)
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
