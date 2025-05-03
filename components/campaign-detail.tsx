"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CampaignDetail({ campaign }: { campaign: any }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(campaign.title)
  const [description, setDescription] = useState(campaign.description || "")

  const handleUpdate = async () => {
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })

    if (res.ok) {
      setOpen(false)
      location.reload()
    } else {
      alert("Failed to update campaign")
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      {campaign.image_url && (
        <Image
          src={campaign.image_url}
          alt={campaign.title}
          width={1200}
          height={400}
          className="rounded-md border border-amber-900/50 object-cover max-h-[400px] w-full"
        />
      )}

      <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-200">{title}</h1>
      <p className="text-amber-800 dark:text-amber-400 italic">{description}</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="text-amber-900 dark:text-amber-200 border-amber-800/30">Edit</Button>
        </DialogTrigger>
        <DialogContent className="bg-parchment-light dark:bg-stone-800">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} className="bg-red-900 hover:bg-red-800 text-amber-100">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}