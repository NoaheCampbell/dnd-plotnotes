import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Skull } from "lucide-react"

const encounters = [
  {
    title: "Goblin Ambush",
    campaign: "Lost Mine of Phandelver",
    difficulty: "Easy",
    location: "Triboar Trail",
    creatures: 4,
  },
  {
    title: "Undead Horde",
    campaign: "Curse of Strahd",
    difficulty: "Hard",
    location: "Barovia Village",
    creatures: 10,
  },
  {
    title: "Frost Giant Scouts",
    campaign: "Storm King's Thunder",
    difficulty: "Medium",
    location: "Ice Spire Mountains",
    creatures: 3,
  },
]

export default function EncountersPage() {
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
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
              <Plus className="mr-2 h-4 w-4" />
              New Encounter
            </Button>
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
              {encounters
                .filter((e) => tab === 'all' || e.difficulty.toLowerCase() === tab)
                .map((encounter, i) => (
                  <Card
                    key={i}
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
                        {encounter.campaign} — {encounter.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-amber-800 dark:text-amber-400">
                        <p>Difficulty: {encounter.difficulty}</p>
                        <p>Creatures: {encounter.creatures}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                      >
                        View Encounter
                      </Button>
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
