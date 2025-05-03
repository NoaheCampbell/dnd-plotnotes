"use client";
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"

const initialNpcs = [
  { name: "Strahd von Zarovich", type: "Vampire Lord", campaign: "Curse of Strahd" },
  { name: "Ireena Kolyana", type: "Noble", campaign: "Curse of Strahd" },
  { name: "Harshnag", type: "Frost Giant", campaign: "Storm King's Thunder" },
  { name: "Kellen Brightspark", type: "Artificer", campaign: "Homebrew Campaign" },
]

export default function NpcsPage() {
  const [search, setSearch] = useState("")

  const filteredNpcs = initialNpcs.filter((npc) =>
    npc.name.toLowerCase().includes(search.toLowerCase()) ||
    npc.type.toLowerCase().includes(search.toLowerCase()) ||
    npc.campaign.toLowerCase().includes(search.toLowerCase())
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
            <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
              <Plus className="mr-2 h-4 w-4" />
              New NPC
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNpcs.map((npc) => (
            <Card
              key={npc.name}
              className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
            >
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">{npc.name}</CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  {npc.type} • {npc.campaign}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  This NPC plays a role in the {npc.campaign} campaign as a {npc.type}.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}