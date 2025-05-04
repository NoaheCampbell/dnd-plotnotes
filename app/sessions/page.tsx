"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CalendarIcon, ClockIcon, PlusIcon, UsersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import Link from "next/link";

interface Session {
  id: number;
  campaign: string;
  date: string;
  time: string;
  location: string;
  players: string[];
  notes: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/sessions")
      .then(res => res.json())
      .then(setSessions);
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(setCampaigns);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch("/api/sessions", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setOpen(false);
      form.reset();
      const newSession = await res.json();
      setSessions([...sessions, newSession]);
    } else {
      alert("Failed to add session");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading text-amber-900 dark:text-amber-200">Sessions</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-900 text-white">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
            <DialogHeader>
              <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">Add Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_id" className="text-amber-900 dark:text-amber-200">Campaign</Label>
                <select name="campaign_id" required className="w-full bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-900 dark:text-amber-200 rounded px-3 py-2">
                  <option value="">Select a campaign</option>
                  {campaigns.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-amber-900 dark:text-amber-200">Date</Label>
                <Input name="date" type="date" required className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-amber-900 dark:text-amber-200">Time</Label>
                <Input name="time" type="time" required className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-amber-900 dark:text-amber-200">Location</Label>
                <Input name="location" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-amber-900 dark:text-amber-200">Notes</Label>
                <Input name="notes" className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30" />
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

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.length > 0 ? (
            sessions.map((session: Session) => (
              <Card key={session.id} className="bg-parchment-light dark:bg-stone-800">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-200">{session.campaign}</CardTitle>
                  <CardDescription className="text-amber-800 dark:text-amber-400">
                    {format(new Date(session.date), "MMMM dd, yyyy")} @ {session.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-800 dark:text-amber-400">Location: {session.location}</p>
                  <p className="text-sm text-amber-800 dark:text-amber-400">Players: {session.players?.join(", ")}</p>
                  <p className="text-sm text-amber-800 dark:text-amber-400">Notes: {session.notes}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/sessions/${session.id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200"
                    >
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-amber-800 dark:text-amber-400 italic">No sessions found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}