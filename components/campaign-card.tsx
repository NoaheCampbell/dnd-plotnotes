"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"

type Props = {
  campaign: {
    id: string
    title: string
    description: string
    progress: number
    sessions: number
    players: number
    lastPlayed: Date
    image?: string | null
  }
}

export default function CampaignCard({ campaign }: Props) {
  return (
    <Card className="overflow-hidden border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
        {campaign.image && (
  <img
    src={campaign.image}
    alt={campaign.title}
    className="w-full h-auto rounded border border-amber-800/30"
  />
)}
      <CardHeader>
        <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">
          {campaign.title}
        </CardTitle>
        <p className="text-sm text-amber-800 dark:text-amber-400">
          {campaign.description}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm text-amber-800 dark:text-amber-400">
          <p><Users className="inline h-4 w-4 mr-1" /> {campaign.players} players</p>
          <p><Calendar className="inline h-4 w-4 mr-1" /> {campaign.sessions} sessions</p>
          <p><Clock className="inline h-4 w-4 mr-1" /> Last played: {campaign.lastPlayed.toLocaleDateString()}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          variant="outline"
          className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
        >
          <Link href={`/campaigns/${campaign.id}`}>View Campaign</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}