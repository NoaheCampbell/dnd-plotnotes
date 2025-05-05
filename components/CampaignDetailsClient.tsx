"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GenericEntityGrid from "@/components/generic-entity-grid";
import { useState } from "react";
import { entitiesConfig } from "@/lib/entities-config";
import GenericEntityForm from "@/components/generic-entity-form";

export default function CampaignDetailsClient({
  campaign,
  npcs,
  locations,
  items,
  notes,
  sessions,
  encounters,
  campaigns,
}: {
  campaign: any;
  npcs: any[];
  locations: any[];
  items: any[];
  notes: any[];
  sessions: any[];
  encounters: any[];
  campaigns: any[];
}) {
  // State for add modals
  const [open, setOpen] = useState<null | string>(null);
  // Helper to open modal for a section
  const openModal = (section: string) => setOpen(section);
  const closeModal = () => setOpen(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-4xl w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 mb-8">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-3xl">
            {campaign.title}
          </CardTitle>
        </CardHeader>
      </Card>
      {/* Sections */}
      <div className="w-full max-w-4xl space-y-8">
        {[
          { label: "NPCs", key: "npcs", data: npcs, config: entitiesConfig.npcs },
          { label: "Locations", key: "locations", data: locations, config: entitiesConfig.locations },
          { label: "Items", key: "items", data: items, config: entitiesConfig.items },
          { label: "Notes", key: "notes", data: notes, config: entitiesConfig.notes },
          { label: "Sessions", key: "sessions", data: sessions, config: entitiesConfig.sessions },
          { label: "Encounters", key: "encounters", data: encounters, config: entitiesConfig.encounters },
        ].map(section => (
          <div key={section.key} className="bg-parchment-light dark:bg-stone-800 border border-amber-800/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200">{section.label}</h2>
              <Button className="bg-amber-800 text-amber-100 hover:bg-amber-700" onClick={() => openModal(section.key)}>
                Add New
              </Button>
            </div>
            <GenericEntityGrid data={section.data} config={section.config} campaigns={campaigns} />
            <GenericEntityForm
              open={open === section.key}
              setOpen={closeModal}
              config={section.config}
              onCreated={() => window.location.reload()}
              campaigns={campaigns}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 