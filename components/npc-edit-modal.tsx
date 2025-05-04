"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function EditNpcModal({ npc }: { npc: any }) {
  const [open, setOpen] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [form, setForm] = useState({
    campaign_id: npc.campaign_id,
    name: npc.name || '',
    type: npc.type || '',
    description: npc.description || '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/campaigns").then(res => res.json()).then(setCampaigns)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString())
        }
      })
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await fetch(`/api/npcs/${npc.id}`, {
        method: "PATCH",
        body: formData,
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update NPC")
      }
      setOpen(false)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 w-full bg-amber-900 hover:bg-amber-800 text-amber-100">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Edit NPC</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="campaign_id" className="text-amber-900 dark:text-amber-200">Campaign</Label>
            <select name="campaign_id" value={form.campaign_id} onChange={handleChange} required className="w-full bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200 rounded px-3 py-2">
              <option value="">Select a campaign</option>
              {campaigns.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-amber-900 dark:text-amber-200">Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} required className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type" className="text-amber-900 dark:text-amber-200">Type</Label>
            <Input name="type" value={form.type} onChange={handleChange} className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-amber-900 dark:text-amber-200">Description</Label>
            <Input name="description" value={form.description} onChange={handleChange} className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input 
              id="image" 
              name="image" 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
            />
            {npc.image_url && !imageFile && (
              <div className="mt-2">
                <img src={npc.image_url} alt="Current NPC" className="max-w-xs rounded border border-amber-800/30" />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="text-amber-900 dark:text-amber-200">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-red-900 hover:bg-red-800 text-amber-100" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 