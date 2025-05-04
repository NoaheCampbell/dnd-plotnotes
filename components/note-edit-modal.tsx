"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function NoteEditModal({ note, campaigns }: { note: any, campaigns: any[] }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    campaign_id: note.campaign_id,
    title: note.title || '',
    content: note.content || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update note")
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
    <div className="mt-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-amber-900 hover:bg-amber-800 text-amber-100">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
          <DialogHeader>
            <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Edit Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="campaign_id">Campaign</Label>
              <select name="campaign_id" value={form.campaign_id} onChange={handleChange} required className="w-full bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200 rounded px-3 py-2">
                <option value="">Select a campaign</option>
                {campaigns.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" value={form.content} onChange={handleChange} className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200 min-h-[120px]" />
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
    </div>
  )
} 