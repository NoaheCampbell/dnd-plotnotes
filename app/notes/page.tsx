"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PenTool, Plus, Search } from "lucide-react"

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [notes, setNotes] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch("/api/notes").then(res => res.json()).then(setNotes)
    fetch("/api/campaigns").then(res => res.json()).then(setCampaigns)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const res = await fetch("/api/notes", {
      method: "POST",
      body: formData,
    })
    if (res.ok) {
      setOpen(false)
      form.reset()
      const newNote = await res.json()
      setNotes([...notes, newNote])
    } else {
      alert("Failed to add note")
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.campaign || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">Notes</h1>
            <p className="text-amber-800 dark:text-amber-400 italic">Capture ideas, lore, and everything in between</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-700 dark:text-amber-500" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
                <DialogHeader>
                  <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Add Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign_id" className="text-amber-900 dark:text-amber-200">Campaign</Label>
                    <select name="campaign_id" required className="w-full bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200 rounded px-3 py-2">
                      <option value="">Select a campaign</option>
                      {campaigns.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-amber-900 dark:text-amber-200">Title</Label>
                    <Input name="title" required className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-amber-900 dark:text-amber-200">Content</Label>
                    <Textarea name="content" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="ghost" className="text-amber-900 dark:text-amber-200">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-red-900 hover:bg-red-800 text-amber-100">Add</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">
                    {note.title}
                  </CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-400">
                    {note.campaign || ""} • {note.created_at ? new Date(note.created_at).toLocaleDateString() : "Unknown date"}
                  </CardDescription>
                </div>
                {/* DropdownMenu for edit/delete can be implemented here if needed */}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  {note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? "..." : "") : "No content available"}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                  asChild
                >
                  <Link href={`/notes/${note.id}`}>View Note</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
