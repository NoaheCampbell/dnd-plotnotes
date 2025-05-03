"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import CampaignCard from "@/components/campaign-card"
import { NewCampaignModal } from "@/components/modals/new-campaign-modal"

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [search, setSearch] = useState("")

  const fetchCampaigns = async () => {
    const res = await fetch("/api/campaigns")
    const data = await res.json()
    setCampaigns(data)
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter((campaign: any) =>
    campaign.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">
              Campaigns
            </h1>
            <p className="text-amber-800 dark:text-amber-400 italic">
              Manage your epic adventures and quests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-700 dark:text-amber-500" />
              <Input
                type="search"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <NewCampaignModal onCreated={fetchCampaigns} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign: any) => (
              <CampaignCard
                key={campaign.id}
                campaign={{
                  id: String(campaign.id),
                  title: campaign.title,
                  description: campaign.description || "",
                  progress: campaign.progress || 0,
                  sessions: campaign.sessions_count || 0,
                  players: campaign.players_count || 0,
                  lastPlayed: campaign.last_played || new Date(),
                  image: campaign.image_url,
                }}
              />
            ))
          ) : (
            <p className="text-amber-800 dark:text-amber-400 italic">No campaigns found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
