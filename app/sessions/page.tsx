"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ClockIcon, PlusIcon, UsersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

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
  const [sessions, setSessions] = useState<Session[]>([{
    id: 1,
    campaign: "Curse of Strahd",
    date: "2025-05-05",
    time: "19:00",
    location: "Online - Roll20",
    players: ["Alice", "Bob", "Charlie"],
    notes: "Prep Amber Temple",
  }]);

  function addSession() {
    const newSession: Session = {
      id: sessions.length + 1,
      campaign: "New Campaign",
      date: new Date().toISOString().split("T")[0],
      time: "18:00",
      location: "Homebrew Location",
      players: ["New Player"],
      notes: "Describe your notes here.",
    };
    setSessions([...sessions, newSession]);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading text-amber-900 dark:text-amber-200">Sessions</h1>
        <Button className="bg-red-900 text-white" onClick={addSession}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Session
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="bg-parchment-light dark:bg-stone-800">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-200">{session.campaign}</CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  {format(new Date(session.date), "MMMM dd, yyyy")} @ {session.time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800 dark:text-amber-400">Location: {session.location}</p>
                <p className="text-sm text-amber-800 dark:text-amber-400">Players: {session.players.join(", ")}</p>
                <p className="text-sm text-amber-800 dark:text-amber-400">Notes: {session.notes}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}