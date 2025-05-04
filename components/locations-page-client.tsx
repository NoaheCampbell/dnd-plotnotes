"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Map } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function LocationsPageClient({ initialLocations }: { initialLocations: any[] }) {
  const [locations, setLocations] = useState(initialLocations)
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const res = await fetch("/api/locations", {
      method: "POST",
      body: formData,
    })
    if (res.ok) {
      setOpen(false)
      form.reset()
      const newLocation = await res.json()
      setLocations([...locations, newLocation])
    } else {
      alert("Failed to add location")
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">
              Locations
            </h1>
            <p className="text-amber-800 dark:text-amber-400 italic">
              Track every city, cave, and lair your players visit
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-700 dark:text-amber-500" />
              <Input
                type="search"
                placeholder="Search locations..."
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
                  <Plus className="mr-2 h-4 w-4" />
                  New Location
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
                <DialogHeader>
                  <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Add Location</DialogTitle>
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
                    <Label htmlFor="description" className="text-amber-900 dark:text-amber-200">Description</Label>
                    <Input name="description" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="map" className="text-amber-900 dark:text-amber-200">Map</Label>
                    <Input type="file" name="map" accept="image/*" className="cursor-pointer text-amber-900 dark:text-amber-200" />
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
          {locations.map((location: { id: number; name: string; type: string | null; description: string | null; map_url: string | null }) => (
            <Card
              key={location.id}
              className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
            >
              {location.map_url ? (
                <img
                  src={location.map_url}
                  alt={location.name}
                  className="w-full h-auto rounded border border-amber-800/30"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-amber-100 dark:bg-stone-900 text-amber-400 dark:text-amber-700 border border-amber-800/30 rounded">
                  <Map className="h-12 w-12" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">
                  {location.name}
                </CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  {location.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  {location.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 