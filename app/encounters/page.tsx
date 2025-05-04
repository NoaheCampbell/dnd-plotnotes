"use client";

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Skull } from "lucide-react"
import Link from "next/link"

export default function EncountersPage() {
  const [encounters, setEncounters] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/encounters").then(res => res.json()).then(setEncounters)
    fetch("/api/campaigns").then(res => res.json()).then(setCampaigns)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const res = await fetch("/api/encounters", {
      method: "POST",
      body: formData,
    })
    if (res.ok) {
      setOpen(false)
      form.reset()
      const newEncounter = await res.json()
      setEncounters([...encounters, newEncounter])
    } else {
      alert("Failed to add encounter")
    }
  }

  const filteredEncounters = encounters.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.campaign || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.location || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">
              Encounters
            </h1>
            <p className="text-amber-800 dark:text-amber-400 italic">Plan battles, challenges, and enemy groups</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-700 dark:text-amber-500" />
              <Input
                type="search"
                placeholder="Search encounters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
                  <Plus className="mr-2 h-4 w-4" />
                  New Encounter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
                <DialogHeader>
                  <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Add Encounter</DialogTitle>
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
                    <Label htmlFor="difficulty" className="text-amber-900 dark:text-amber-200">Difficulty</Label>
                    <select name="difficulty" required className="w-full bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200 rounded px-3 py-2">
                      <option value="">Select difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-amber-900 dark:text-amber-200">Location</Label>
                    <Input name="location" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creatures" className="text-amber-900 dark:text-amber-200">Number of Creatures</Label>
                    <Input name="creatures" type="number" min="1" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
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

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-amber-100/50 dark:bg-amber-900/20 border border-amber-800/30 dark:border-amber-800/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200">
              All
            </TabsTrigger>
            <TabsTrigger value="easy" className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200">
              Easy
            </TabsTrigger>
            <TabsTrigger value="medium" className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200">
              Medium
            </TabsTrigger>
            <TabsTrigger value="hard" className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200">
              Hard
            </TabsTrigger>
          </TabsList>

          {['all', 'easy', 'medium', 'hard'].map((tab) => (
            <TabsContent value={tab} key={tab} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEncounters
                .filter((e) => tab === 'all' || (e.difficulty || '').toLowerCase() === tab)
                .map((encounter, i) => (
                  <Card
                    key={encounter.id || i}
                    className="overflow-hidden border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Skull className="h-4 w-4 text-red-900 dark:text-amber-200" />
                        <CardTitle className="text-lg font-heading text-amber-900 dark:text-amber-200">
                          {encounter.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-amber-800 dark:text-amber-400">
                        {encounter.campaign || ''} — {encounter.location || ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-amber-800 dark:text-amber-400">
                        <p>Difficulty: {encounter.difficulty || 'Unknown'}</p>
                        <p>Creatures: {encounter.creatures || 'N/A'}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/encounters/${encounter.id}`} className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                        >
                          View Encounter
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
