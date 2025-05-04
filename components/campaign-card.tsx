"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

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
    active: boolean
  },
  onStatusChange?: () => void
  onDelete?: () => void
}

export default function CampaignCard({ campaign, onStatusChange, onDelete }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleToggle = async () => {
    await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !campaign.active }),
    })
    if (onStatusChange) onStatusChange()
  }

  const handleDelete = async () => {
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      if (onDelete) onDelete()
    } else {
      alert('Failed to delete campaign')
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
        {campaign.image ? (
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-auto rounded border border-amber-800/30"
          />
        ) : (
          <div className="w-full h-32 flex items-center justify-center bg-amber-100 dark:bg-stone-900 text-amber-400 dark:text-amber-700 border border-amber-800/30 rounded">
            No Image
          </div>
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
        <CardFooter className="flex flex-col gap-2">
          <div className="flex w-full gap-2">
            <button
              className={`px-2 py-1 rounded flex-1 ${campaign.active ? 'bg-green-600 text-white' : 'bg-gray-400 text-black'}`}
              onClick={handleToggle}
            >
              {campaign.active ? 'Active' : 'Inactive'}
            </button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              className="flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
          >
            <Link href={`/campaigns/${campaign.id}`}>View Campaign</Link>
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-parchment-light dark:bg-stone-800">
          <DialogHeader>
            <DialogTitle className="text-amber-900 dark:text-amber-200">Delete Campaign</DialogTitle>
            <DialogDescription className="text-amber-800 dark:text-amber-400">
              Are you sure you want to delete "{campaign.title}"? This action cannot be undone and will delete all associated data (sessions, NPCs, items, etc.).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-amber-900 dark:text-amber-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}