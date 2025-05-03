import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, MoreHorizontal, Plus, Search, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function CampaignsPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">
              Campaigns
            </h1>
            <p className="text-amber-800 dark:text-amber-400 italic">Manage your epic adventures and quests</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-700 dark:text-amber-500" />
              <Input
                type="search"
                placeholder="Search campaigns..."
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="bg-amber-100/50 dark:bg-amber-900/20 border border-amber-800/30 dark:border-amber-800/20">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200"
            >
              Archived
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200"
            >
              Templates
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Curse of Strahd",
                  description: "Gothic horror adventure in the demiplane of Barovia",
                  progress: 65,
                  sessions: 12,
                  players: 5,
                  lastPlayed: "2 days ago",
                  image: "/placeholder.svg?height=100&width=200",
                  color: "bg-red-900",
                },
                {
                  title: "Storm King's Thunder",
                  description: "Giants threaten the small folk of the Sword Coast",
                  progress: 30,
                  sessions: 6,
                  players: 4,
                  lastPlayed: "1 week ago",
                  image: "/placeholder.svg?height=100&width=200",
                  color: "bg-purple-800",
                },
                {
                  title: "Homebrew Campaign",
                  description: "Custom adventure in a world of your creation",
                  progress: 10,
                  sessions: 2,
                  players: 6,
                  lastPlayed: "2 weeks ago",
                  image: "/placeholder.svg?height=100&width=200",
                  color: "bg-amber-600",
                },
              ].map((campaign) => (
                <Card
                  key={campaign.title}
                  className="overflow-hidden border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
                >
                  <div className="aspect-video w-full bg-amber-100/50 dark:bg-amber-900/30 relative">
                    <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=200')] bg-cover bg-center opacity-60"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="text-lg font-heading font-bold text-white drop-shadow-md">{campaign.title}</h3>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">
                        {campaign.title}
                      </CardTitle>
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
                            Edit Campaign
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-amber-900 dark:text-amber-200 focus:bg-amber-100/50 focus:text-amber-900 dark:focus:bg-amber-900/30 dark:focus:text-amber-200">
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-amber-900 dark:text-amber-200 focus:bg-amber-100/50 focus:text-amber-900 dark:focus:bg-amber-900/30 dark:focus:text-amber-200">
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="text-amber-800 dark:text-amber-400">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-amber-900 dark:text-amber-200">Progress</span>
                          <span className="font-medium text-amber-900 dark:text-amber-200">{campaign.progress}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <div
                            className={`h-full rounded-full ${campaign.color}`}
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-amber-800 dark:text-amber-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{campaign.sessions} sessions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{campaign.players} players</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{campaign.lastPlayed}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                      asChild
                    >
                      <Link href={`/campaigns/${campaign.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        View Campaign
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Card className="flex h-full flex-col items-center justify-center p-6 border-dashed border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100/50 dark:bg-amber-900/30">
                  <Plus className="h-10 w-10 text-amber-800 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-xl font-heading font-medium text-amber-900 dark:text-amber-200">
                  Create a new campaign
                </h3>
                <p className="mt-2 text-center text-sm text-amber-800 dark:text-amber-400">
                  Start a new adventure for your players with a blank campaign or from a template
                </p>
                <Button className="mt-4 bg-red-900 hover:bg-red-800 text-amber-100">
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="archived" className="space-y-4">
            <div className="rounded-lg border border-amber-800/30 p-8 text-center bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
              <BookOpen className="mx-auto h-12 w-12 text-amber-800 dark:text-amber-400" />
              <h3 className="mt-4 text-lg font-heading font-medium text-amber-900 dark:text-amber-200">
                No Archived Campaigns
              </h3>
              <p className="mt-2 text-sm text-amber-800 dark:text-amber-400">
                You haven't archived any campaigns yet. Archived campaigns will appear here.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Lost Mine of Phandelver",
                  description: "A starter adventure for levels 1-5",
                  type: "Official",
                  image: "/placeholder.svg?height=100&width=200",
                },
                {
                  title: "Curse of Strahd",
                  description: "Gothic horror adventure in Barovia",
                  type: "Official",
                  image: "/placeholder.svg?height=100&width=200",
                },
                {
                  title: "Blank Campaign",
                  description: "Start with a clean slate",
                  type: "Basic",
                  image: "/placeholder.svg?height=100&width=200",
                },
              ].map((template) => (
                <Card
                  key={template.title}
                  className="overflow-hidden border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20"
                >
                  <div className="aspect-video w-full bg-amber-100/50 dark:bg-amber-900/30 relative">
                    <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=200')] bg-cover bg-center opacity-60"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="text-lg font-heading font-bold text-white drop-shadow-md">{template.title}</h3>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">
                        {template.title}
                      </CardTitle>
                      <div className="rounded-full bg-amber-100/50 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-200">
                        {template.type}
                      </div>
                    </div>
                    <CardDescription className="text-amber-800 dark:text-amber-400">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full bg-red-900 hover:bg-red-800 text-amber-100">Use Template</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
