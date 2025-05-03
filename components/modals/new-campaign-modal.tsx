"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

export function NewCampaignModal({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await fetch("/api/campaigns", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      setOpen(false)
      formRef.current?.reset()
      onCreated?.()
    } else {
      alert("Failed to create campaign")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Create New Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} ref={formRef} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-amber-900 dark:text-amber-200">Title</Label>
            <Input name="title" required className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-amber-900 dark:text-amber-200">Description</Label>
            <Textarea name="description" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-amber-900 dark:text-amber-200">Image</Label>
            <Input type="file" name="image" accept="image/*" className="cursor-pointer text-amber-900 dark:text-amber-200" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="text-amber-900 dark:text-amber-200">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-red-900 hover:bg-red-800 text-amber-100">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}