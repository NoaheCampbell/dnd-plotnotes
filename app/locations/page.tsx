import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"

const mockData = [
  {
    name: "Neverwinter",
    type: "City",
    description: "A major city on the Sword Coast.",
  },
  {
    name: "Undermountain",
    type: "Dungeon",
    description: "A vast dungeon beneath Waterdeep.",
  },
  {
    name: "High Forest",
    type: "Wilderness",
    description: "A mysterious, ancient forest."
  },
]

export default function LocationsPage() {
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
            <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
              <Plus className="mr-2 h-4 w-4" />
              New Location
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockData.map((location, i) => (
            <Card
              key={i}
              className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
            >
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
