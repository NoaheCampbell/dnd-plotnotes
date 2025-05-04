"use client";
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default function NpcsPage() {
  const [search, setSearch] = useState("")
  const [npcs, setNpcs] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch("/api/npcs").then(res => res.json()).then(setNpcs)
    fetch("/api/campaigns").then(res => res.json()).then(setCampaigns)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const res = await fetch("/api/npcs", {
      method: "POST",
      body: formData,
    })
    if (res.ok) {
      setOpen(false)
      form.reset()
      const newNpc = await res.json()
      setNpcs([...npcs, newNpc])
    } else {
      alert("Failed to add NPC")
    }
  }

  const filteredNpcs = npcs.filter((npc) =>
    npc.name.toLowerCase().includes(search.toLowerCase()) ||
    (npc.type || "").toLowerCase().includes(search.toLowerCase()) ||
    (npc.campaign || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">NPCs</h1>
            <p className="text-amber-800 dark:text-amber-400 italic">Your cast of characters across all campaigns</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-700 dark:text-amber-500" />
              <Input
                type="search"
                placeholder="Search NPCs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
                  <Plus className="mr-2 h-4 w-4" />
                  New NPC
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
                <DialogHeader>
                  <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Add NPC</DialogTitle>
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
                    <Label htmlFor="name" className="text-amber-900 dark:text-amber-200">Name</Label>
                    <Input name="name" required className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-amber-900 dark:text-amber-200">Type</Label>
                    <Input name="type" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-amber-900 dark:text-amber-200">Description</Label>
                    <Input name="description" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-amber-900 dark:text-amber-200">Image</Label>
                    <Input 
                      id="image" 
                      name="image" 
                      type="file" 
                      accept="image/*"
                      className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30"
                    />
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
          {filteredNpcs.length > 0 ? (
            filteredNpcs.map((npc) => (
              <Card
                key={npc.id || npc.name}
                className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
              >
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">{npc.name}</CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-400">
                    {npc.type || "Type not specified"} • {npc.campaign || ""}
                  </CardDescription>
                  {npc.image_url && (
                    <div className="mt-2">
                      <img 
                        src={npc.image_url} 
                        alt={npc.name} 
                        className="w-full h-48 object-cover rounded border border-amber-800/30"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    {npc.description || "No description available"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/npcs/${npc.id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                    >
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-amber-800 dark:text-amber-400 italic">No NPCs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}