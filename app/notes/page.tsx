"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PenTool, Plus, Search } from "lucide-react"

const notes = [
  {
    id: 1,
    title: "Strahd's Weaknesses",
    campaign: "Curse of Strahd",
    lastUpdated: "2 days ago",
  },
  {
    id: 2,
    title: "Giant Rune Lore",
    campaign: "Storm King's Thunder",
    lastUpdated: "1 week ago",
  },
  {
    id: 3,
    title: "New Magic Item Ideas",
    campaign: "Homebrew Campaign",
    lastUpdated: "4 days ago",
  },
]

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.campaign.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
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
                    {note.campaign} • Updated {note.lastUpdated}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
                  >
                    <DropdownMenuItem className="text-amber-900 dark:text-amber-200 focus:bg-amber-100/50 focus:text-amber-900 dark:focus:bg-amber-900/30 dark:focus:text-amber-200">
                      Edit Note
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-amber-900 dark:text-amber-200 focus:bg-amber-100/50 focus:text-amber-900 dark:focus:bg-amber-900/30 dark:focus:text-amber-200">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  This is a brief preview or summary of the note’s content...
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
