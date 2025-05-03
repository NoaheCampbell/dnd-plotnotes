import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, Plus, Search, Skull, Users } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">
              Grimoire
            </h1>
            <p className="text-amber-800 dark:text-amber-400 italic">
              Welcome back, Dungeon Master. Your adventures await.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-700 dark:text-amber-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-amber-100/50 dark:bg-amber-900/20 border border-amber-800/30 dark:border-amber-800/20">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-200"
            >
              Recent
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-900"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Active Campaigns
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">3</div>
                  <p className="text-xs text-amber-800 dark:text-amber-400">+1 from last month</p>
                </CardContent>
              </Card>
              <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-800"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Upcoming Sessions
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">2</div>
                  <p className="text-xs text-amber-800 dark:text-amber-400">Next: Friday, 7:00 PM</p>
                </CardContent>
              </Card>
              <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-600"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">Total NPCs</CardTitle>
                  <Users className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">42</div>
                  <p className="text-xs text-amber-800 dark:text-amber-400">Across all campaigns</p>
                </CardContent>
              </Card>
              <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-700"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Planned Encounters
                  </CardTitle>
                  <Skull className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">12</div>
                  <p className="text-xs text-amber-800 dark:text-amber-400">Ready for your players</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">Campaign Progress</CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-400">
                    Track your active campaigns and their progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Curse of Strahd", progress: 65, sessions: 12, color: "bg-red-900" },
                      { name: "Storm King's Thunder", progress: 30, sessions: 6, color: "bg-purple-800" },
                      { name: "Homebrew Campaign", progress: 10, sessions: 2, color: "bg-amber-600" },
                    ].map((campaign) => (
                      <div key={campaign.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-amber-900 dark:text-amber-200">{campaign.name}</div>
                          <div className="text-sm text-amber-800 dark:text-amber-400">{campaign.progress}%</div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <div
                            className={`h-full rounded-full ${campaign.color}`}
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-amber-800 dark:text-amber-400">
                          {campaign.sessions} sessions played
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3 border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">Upcoming Sessions</CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-400">
                    Your scheduled D&D sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { campaign: "Curse of Strahd", date: "Friday, May 5", time: "7:00 PM", players: 5 },
                      { campaign: "Storm King's Thunder", date: "Sunday, May 7", time: "2:00 PM", players: 4 },
                    ].map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 rounded-lg border border-amber-800/20 p-3 bg-amber-50/30 dark:bg-amber-900/10"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/20 dark:bg-red-900/30">
                          <Calendar className="h-5 w-5 text-red-900 dark:text-amber-200" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none text-amber-900 dark:text-amber-200">
                            {session.campaign}
                          </p>
                          <p className="text-xs text-amber-800 dark:text-amber-400">{session.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-700 dark:text-amber-500" />
                            <span className="text-xs text-amber-800 dark:text-amber-400">{session.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-amber-700 dark:text-amber-500" />
                            <span className="text-xs text-amber-800 dark:text-amber-400">{session.players}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Session
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">Recent NPCs</CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-400">
                    Characters you've recently created or updated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Strahd von Zarovich", type: "Vampire Lord", campaign: "Curse of Strahd" },
                      { name: "Ireena Kolyana", type: "Noble", campaign: "Curse of Strahd" },
                      { name: "Harshnag", type: "Frost Giant", campaign: "Storm King's Thunder" },
                    ].map((npc, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-900 dark:text-amber-200 font-medium">
                          {npc.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{npc.name}</p>
                          <p className="text-xs text-amber-800 dark:text-amber-400">
                            {npc.type} • {npc.campaign}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                  >
                    View All NPCs
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">Recent Locations</CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-400">
                    Places your party has visited or will visit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Castle Ravenloft", type: "Fortress", campaign: "Curse of Strahd" },
                      { name: "Village of Barovia", type: "Settlement", campaign: "Curse of Strahd" },
                      { name: "Eye of the All-Father", type: "Temple", campaign: "Storm King's Thunder" },
                    ].map((location, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-900 dark:text-amber-200 font-medium">
                          {location.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{location.name}</p>
                          <p className="text-xs text-amber-800 dark:text-amber-400">
                            {location.type} • {location.campaign}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                  >
                    View All Locations
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">Recent Notes</CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-400">
                    Your latest campaign notes and ideas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: "Strahd's Motivations", campaign: "Curse of Strahd", date: "2 days ago" },
                      { title: "Giant Rune Magic", campaign: "Storm King's Thunder", date: "1 week ago" },
                      { title: "Homebrew Magic Items", campaign: "Homebrew Campaign", date: "2 weeks ago" },
                    ].map((note, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{note.title}</p>
                        <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-400">
                          <span>{note.campaign}</span>
                          <span>•</span>
                          <span>{note.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                  >
                    View All Notes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4">
            <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">Upcoming Sessions</CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  Plan and prepare for your next D&D sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      campaign: "Curse of Strahd",
                      date: "Friday, May 5",
                      time: "7:00 PM - 11:00 PM",
                      players: ["Alice", "Bob", "Charlie", "Dave", "Eve"],
                      location: "Online - Roll20",
                      notes: "The party will be exploring the Amber Temple. Prepare the map and monster stats.",
                    },
                    {
                      campaign: "Storm King's Thunder",
                      date: "Sunday, May 7",
                      time: "2:00 PM - 6:00 PM",
                      players: ["Frank", "Grace", "Heidi", "Ivan"],
                      location: "Bob's House",
                      notes:
                        "The party will be meeting with the Frost Giants. Review the giant lore and prepare NPC dialogues.",
                    },
                  ].map((session, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-amber-800/20 p-4 bg-amber-50/30 dark:bg-amber-900/10"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-heading font-semibold text-lg text-amber-900 dark:text-amber-200">
                            {session.campaign}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-amber-800 dark:text-amber-400">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date}</span>
                            <span>•</span>
                            <Clock className="h-4 w-4" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-red-900 hover:bg-red-800 text-amber-100">
                          Prepare Session
                        </Button>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200">
                            Players ({session.players.length})
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {session.players.map((player) => (
                              <div
                                key={player}
                                className="rounded-full bg-amber-100/50 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs text-amber-900 dark:text-amber-200"
                              >
                                {player}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200">Location</h4>
                          <p className="mt-1 text-sm text-amber-800 dark:text-amber-400">{session.location}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200">Session Notes</h4>
                        <p className="mt-1 text-sm text-amber-800 dark:text-amber-400">{session.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-red-900 hover:bg-red-800 text-amber-100">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule New Session
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="recent" className="space-y-4">
            <Card className="border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">Recent Activity</CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  Your recent actions and updates across all campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Created a new NPC",
                      details: "Ezmerelda d'Avenir",
                      campaign: "Curse of Strahd",
                      time: "Yesterday",
                    },
                    {
                      action: "Updated location",
                      details: "Castle Ravenloft - Added details to the Chapel",
                      campaign: "Curse of Strahd",
                      time: "2 days ago",
                    },
                    {
                      action: "Added session notes",
                      details: "Session #11 - The party defeated the vampire spawn",
                      campaign: "Curse of Strahd",
                      time: "5 days ago",
                    },
                    {
                      action: "Created a new encounter",
                      details: "Frost Giant Patrol",
                      campaign: "Storm King's Thunder",
                      time: "1 week ago",
                    },
                    {
                      action: "Added a new item",
                      details: "Staff of Frost",
                      campaign: "Storm King's Thunder",
                      time: "1 week ago",
                    },
                    {
                      action: "Created a new campaign",
                      details: "Homebrew Campaign",
                      campaign: "Homebrew Campaign",
                      time: "2 weeks ago",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 rounded-lg border border-amber-800/20 p-3 bg-amber-50/30 dark:bg-amber-900/10"
                    >
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-red-900" />
                      <div className="flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                          <p className="font-medium text-amber-900 dark:text-amber-200">{activity.action}</p>
                          <p className="text-xs text-amber-800 dark:text-amber-400">{activity.time}</p>
                        </div>
                        <p className="text-sm text-amber-900 dark:text-amber-200">{activity.details}</p>
                        <p className="text-xs text-amber-800 dark:text-amber-400">{activity.campaign}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                >
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
