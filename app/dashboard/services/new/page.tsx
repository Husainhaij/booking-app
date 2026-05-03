import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import NewServiceForm from "@/components/dashboard/NewServiceForm"

export default async function NewServicePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  return <NewServiceForm />
}


