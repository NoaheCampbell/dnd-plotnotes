"use client";
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreHorizontal, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ItemsPage() {
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch("/api/items")
      .then(res => res.json())
      .then(setItems)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const res = await fetch("/api/items", {
      method: "POST",
      body: formData,
    })
    if (res.ok) {
      setOpen(false)
      form.reset()
      const newItem = await res.json()
      setItems([...items, newItem])
    } else {
      alert("Failed to add item")
    }
  }

  const filtered = items.filter((item) =>
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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
                  <Plus className="mr-2 h-4 w-4" />
                  New Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
                <DialogHeader>
                  <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Add Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-amber-900 dark:text-amber-200">Name</Label>
                    <Input name="name" required className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-amber-900 dark:text-amber-200">Type</Label>
                    <Input name="type" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rarity" className="text-amber-900 dark:text-amber-200">Rarity</Label>
                    <Input name="rarity" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign" className="text-amber-900 dark:text-amber-200">Campaign</Label>
                    <Input name="campaign" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-amber-900 dark:text-amber-200">Image</Label>
                    <Input type="file" name="image" accept="image/*" className="cursor-pointer text-amber-900 dark:text-amber-200" />
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
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-auto rounded border border-amber-800/30"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-amber-100 dark:bg-stone-900 text-amber-400 dark:text-amber-700 border border-amber-800/30 rounded">
                  <Package className="h-12 w-12" />
                </div>
              )}
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
                <Link href={`/items/${item.id}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                  >
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}