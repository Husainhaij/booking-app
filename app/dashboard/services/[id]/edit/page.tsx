import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EditServiceForm from "@/components/dashboard/EditServiceForm"

type Props = { params: { id: string } }

export default async function EditServicePage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const service = await prisma.service.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, duration: true, price: true, isActive: true, providerId: true },
  })

  if (!service || service.providerId !== session.user.id) notFound()

  return (
    <EditServiceForm
      service={{ ...service, price: service.price.toString() }}
    />
  )
}
