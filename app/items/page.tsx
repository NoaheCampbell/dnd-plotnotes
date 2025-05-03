"use client";
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreHorizontal, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const allItems = [
  {
    name: "Staff of Frost",
    type: "Wondrous Item",
    rarity: "Legendary",
    campaign: "Storm King's Thunder",
  },
  {
    name: "Sunblade",
    type: "Weapon",
    rarity: "Rare",
    campaign: "Curse of Strahd",
  },
  {
    name: "Potion of Invisibility",
    type: "Consumable",
    rarity: "Very Rare",
    campaign: "Homebrew Campaign",
  },
]

export default function ItemsPage() {
  const [search, setSearch] = useState("")

  const filtered = allItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">
              Items
            </h1>
            <p className="text-amber-800 dark:text-amber-400 italic">
              Manage magical items and artifacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-700 dark:text-amber-500" />
              <Input
                type="search"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
              <Plus className="mr-2 h-4 w-4" />
              New Item
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card
              key={item.name}
              className="overflow-hidden border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
            >
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-400">
                    {item.type} • {item.rarity}
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
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-amber-900 dark:text-amber-200 focus:bg-amber-100/50 focus:text-amber-900 dark:focus:bg-amber-900/30 dark:focus:text-amber-200">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="text-sm text-amber-800 dark:text-amber-400">
                Appears in: {item.campaign}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}