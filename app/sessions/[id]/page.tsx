import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GenericEntityDetailsClient from "@/components/GenericEntityDetailsClient"
import { entitiesConfig } from "@/lib/entities-config"

interface SessionPageProps {
  params: {
    id: string
  }
}

export default async function SessionDetailsPage({ params }: SessionPageProps) {
  const awaitedParams = await params;
  const session = await prisma.sessions.findUnique({
    where: { id: Number(awaitedParams.id) },
    include: { campaigns: true },
  })
  if (!session) return notFound()
  return <GenericEntityDetailsClient entity={session} config={entitiesConfig.sessions} apiPath="/sessions" />
} 