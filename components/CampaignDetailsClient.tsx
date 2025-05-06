"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GenericEntityGrid from "@/components/generic-entity-grid";
import { useState } from "react";
import { entitiesConfig } from "@/lib/entities-config";
import GenericEntityForm from "@/components/generic-entity-form";
import { getFullEntityConfig } from "@/lib/get-full-entity-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Helper to robustly stringify any value for rendering
function renderValue(val: any): string {
  if (val == null) return "N/A";
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) return val.map(renderValue).join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return val.toString();
}

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
  // State for add modals and edit/delete modals per section
  const [open, setOpen] = useState<null | string>(null);
  const [editEntity, setEditEntity] = useState<{ [key: string]: any }>({});
  const [deleteEntity, setDeleteEntity] = useState<{ [key: string]: any }>({});
  // State for expanded sections (allow multiple open)
  const [expandedSections, setExpandedSections] = useState<string[]>(["npcs"]);
  // Helper to open modal for a section
  const openModal = (section: string) => setOpen(section);
  const closeModal = () => setOpen(null);

  const sections = [
    { label: "NPCs", key: "npcs", data: npcs, config: entitiesConfig.npcs },
    { label: "Locations", key: "locations", data: locations, config: entitiesConfig.locations },
    { label: "Items", key: "items", data: items, config: entitiesConfig.items },
    { label: "Notes", key: "notes", data: notes, config: entitiesConfig.notes },
    { label: "Sessions", key: "sessions", data: sessions, config: entitiesConfig.sessions },
    { label: "Encounters", key: "encounters", data: encounters, config: entitiesConfig.encounters },
  ];

  async function handleDelete(sectionKey: string, entity: any) {
    await fetch(`/api/${sectionKey}/${entity.id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-4xl w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 mb-8">
        {campaign.image_url && (
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-64 object-cover rounded-t-lg border-b border-amber-800/30"
          />
        )}
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-3xl">
            {campaign.title}
          </CardTitle>
        </CardHeader>
      </Card>
      {/* Wiki-style collapsible sections */}
      <div className="w-full max-w-4xl space-y-4">
        {sections.map(section => {
          const isExpanded = expandedSections.includes(section.key);
          return (
            <div key={section.key} className="bg-parchment-light dark:bg-stone-800 border border-amber-800/20 rounded-lg">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-xl font-bold text-amber-900 dark:text-amber-200 bg-amber-50/40 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition font-heading rounded-t-lg focus:outline-none"
                onClick={() => setExpandedSections(prev => prev.includes(section.key) ? prev.filter(k => k !== section.key) : [...prev, section.key])}
                aria-expanded={isExpanded}
              >
                <span>{section.label}</span>
                <span className="ml-2 text-amber-700 dark:text-amber-400">{isExpanded ? "▲" : "▼"}</span>
              </button>
              {isExpanded && (
                <div className="p-4">
                  <div className="flex items-center justify-end mb-2">
                    <Button
                      className="bg-amber-800 text-amber-100 hover:bg-amber-700"
                      onClick={() => {
                        openModal(section.key);
                        setEditEntity(prev => ({
                          ...prev,
                          [section.key]: section.key === "sessions"
                            ? { campaign_id: campaign.id, date: new Date().toISOString().slice(0, 10) }
                            : { campaign_id: campaign.id }
                        }));
                      }}
                    >
                      Add New
                    </Button>
                  </div>
                  <GenericEntityGrid
                    data={section.data}
                    config={section.config}
                    campaigns={campaigns}
                    wikiMode={true}
                    onEdit={item => setEditEntity(prev => ({ ...prev, [section.key]: item }))}
                    onDelete={item => setDeleteEntity(prev => ({ ...prev, [section.key]: item }))}
                  />
                  <GenericEntityForm
                    open={open === section.key || !!editEntity[section.key]}
                    setOpen={v => {
                      if (!v) {
                        closeModal();
                        setEditEntity(prev => ({ ...prev, [section.key]: null }));
                      }
                    }}
                    config={getFullEntityConfig(section.config, `/${section.key}`, campaigns)}
                    onCreated={() => window.location.reload()}
                    campaigns={campaigns}
                    entity={editEntity[section.key] || undefined}
                  />
                  {/* Delete Modal */}
                  <Dialog open={!!deleteEntity[section.key]} onOpenChange={v => {
                    if (!v) setDeleteEntity(prev => ({ ...prev, [section.key]: null }));
                  }}>
                    <DialogContent className="bg-parchment-light dark:bg-stone-800 border-amber-800/20">
                      <DialogHeader>
                        <DialogTitle className="text-amber-900 dark:text-amber-200">
                          Delete {section.label.slice(0, -1)}
                        </DialogTitle>
                      </DialogHeader>
                      <p className="text-amber-800 dark:text-amber-400 mb-4">
                        Are you sure you want to delete "{renderValue(deleteEntity[section.key]?.title || deleteEntity[section.key]?.name)}"? This action cannot be undone.
                      </p>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" className="text-amber-900 dark:text-amber-200 border-amber-800/30">Cancel</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(section.key, deleteEntity[section.key])}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 