import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, Plus, Search, Skull, Users } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import Link from "next/link"
import { ShowInactiveToggle } from "@/components/show-inactive-toggle"

interface PageProps {
  searchParams: {
    showInactive?: string
  }
}

export default async function Dashboard({ searchParams }: PageProps) {
  const showInactive = searchParams.showInactive === "true"

  // Fetch campaigns with their related data
  const campaigns = await prisma.campaigns.findMany({
    where: showInactive ? undefined : { active: true },
    include: {
      sessions: {
        orderBy: { date: 'asc' },
        take: 2
      },
      npcs: {
        take: 3
      },
      notes: {
        take: 3,
        orderBy: { created_at: 'desc' }
      }
    },
    orderBy: { last_played: 'desc' }
  })
  type CampaignWithRelations = typeof campaigns[number]

  // Calculate stats
  const activeCampaigns = campaigns.length
  const totalNpcs = campaigns.reduce((sum: number, campaign: CampaignWithRelations) => sum + campaign.npcs.length, 0)
  const upcomingSessions = campaigns
    .flatMap((c: CampaignWithRelations) => c.sessions)
    .filter((s: CampaignWithRelations["sessions"][number]) => s.date > new Date())
  const nextSession = upcomingSessions[0]

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
          <div className="flex items-center gap-4">
            <ShowInactiveToggle />
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-700 dark:text-amber-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <Link href="/campaigns/new">
              <Button className="bg-red-900 hover:bg-red-800 text-amber-100">
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Active Campaigns
              </CardTitle>
              <BookOpen className="h-4 w-4 text-amber-700 dark:text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{activeCampaigns}</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Total NPCs
              </CardTitle>
              <Users className="h-4 w-4 text-amber-700 dark:text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{totalNpcs}</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Next Session
              </CardTitle>
              <Calendar className="h-4 w-4 text-amber-700 dark:text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                {nextSession ? format(nextSession.date, 'MMM d, yyyy') : 'None scheduled'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Last Played
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-700 dark:text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                {campaigns[0]?.last_played ? format(campaigns[0].last_played, 'MMM d, yyyy') : 'Never'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
            <TabsTrigger value="campaigns" className="text-amber-900 dark:text-amber-200">Campaigns</TabsTrigger>
            <TabsTrigger value="sessions" className="text-amber-900 dark:text-amber-200">Sessions</TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign: CampaignWithRelations) => (
                <Card key={campaign.id} className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
                  {campaign.image_url && (
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-full h-40 object-cover rounded-t-lg border-b border-amber-800/30"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-200">{campaign.title}</CardTitle>
                    <CardDescription className="text-amber-800 dark:text-amber-400">
                      {campaign.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-amber-800 dark:text-amber-400">
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        {campaign.players_count || 0} players
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {campaign.sessions_count || 0} sessions
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/campaigns/${campaign.id}`} className="w-full">
                      <Button className="w-full bg-red-900 hover:bg-red-800 text-amber-100">
                        View Campaign
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="sessions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.flatMap((campaign: CampaignWithRelations) => campaign.sessions).map((session: CampaignWithRelations["sessions"][number]) => (
                <Card key={session.id} className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30">
                  <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-200">
                      {format(session.date, 'MMM d, yyyy')}
                    </CardTitle>
                    <CardDescription className="text-amber-800 dark:text-amber-400">
                      {session.location || 'Location not specified'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                      {session.notes || 'No notes available'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
