"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function EditSessionModal({ session }: { session: any }) {
  const [open, setOpen] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [form, setForm] = useState({
    campaign_id: session.campaign_id,
    date: session.date ? new Date(session.date).toISOString().slice(0, 10) : '',
    time: session.date ? new Date(session.date).toISOString().slice(11, 16) : '',
    location: session.location || '',
    notes: session.notes || '',
  })

  useEffect(() => {
    fetch("/api/campaigns").then(res => res.json()).then(setCampaigns)
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setOpen(false)
      window.location.reload()
    } else {
      alert("Failed to update session")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 w-full bg-amber-900 hover:bg-amber-800 text-amber-100">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Edit Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="date" className="text-amber-900 dark:text-amber-200">Date</Label>
            <Input name="date" type="date" value={form.date} onChange={handleChange} required className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-amber-900 dark:text-amber-200">Time</Label>
            <Input name="time" type="time" value={form.time} onChange={handleChange} required className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-amber-900 dark:text-amber-200">Location</Label>
            <Input name="location" value={form.location} onChange={handleChange} className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-amber-900 dark:text-amber-200">Notes</Label>
            <Input name="notes" value={form.notes} onChange={handleChange} className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="text-amber-900 dark:text-amber-200">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-red-900 hover:bg-red-800 text-amber-100">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 