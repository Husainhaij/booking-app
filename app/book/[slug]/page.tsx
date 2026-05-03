import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BookingFlow from "@/components/booking/BookingFlow"

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const provider = await prisma.user.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  })
  if (!provider) return { title: "غير موجود" }
  return { title: `احجز موعدًا مع ${provider.name}` }
}

export default async function BookingPage({ params }: Props) {
  const provider = await prisma.user.findUnique({
    where: { slug: params.slug },
    select: {
      id: true, name: true, slug: true,
      services: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, duration: true, price: true },
      },
    },
  })

  if (!provider) notFound()

  const serialized = {
    ...provider,
    services: provider.services.map((s: { id: string; name: string; duration: number; price: { toString: () => string } }) => ({
      ...s, price: s.price.toString(),
    })),
  }

  return <BookingFlow provider={serialized} />
}
