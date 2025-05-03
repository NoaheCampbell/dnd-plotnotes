import { prisma } from "@/lib/prisma"
import CampaignDetail from "@/components/campaign-detail"

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) return <div className="p-4 text-red-700">Invalid campaign ID</div>

  const campaign = await prisma.campaigns.findUnique({
    where: { id },
  })

  if (!campaign) {
    return <div className="p-4 text-red-700">Campaign not found</div>
  }

  return <CampaignDetail campaign={campaign} />
}