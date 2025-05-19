"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFullEntityConfig } from "@/lib/get-full-entity-config";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import GenericEntityForm from "@/components/generic-entity-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

interface GenericEntityDetailsClientProps {
  entity: any;
  config: any;
  apiPath: string;
  campaigns?: any[];
  campaignLocations?: Array<{ id: any; name: string; [key: string]: any; }>;
}

export default function GenericEntityDetailsClient({
  entity,
  config,
  apiPath,
  campaigns = [],
  campaignLocations
}: GenericEntityDetailsClientProps) {
  const fullConfig = getFullEntityConfig(config, apiPath, campaigns);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Render main fields
  const mainField = config.fields[0]?.name;
  const descriptionField = config.descriptionField;
  const imageField = config.imageField;

  // Debug: log the entity object to check what fields are present

  async function handleDelete() {
    // Parse entity type from apiPath (e.g., '/npcs' -> 'npcs')
    const entityType = apiPath.replace(/^\//, '').split("/")[0];
    await fetch(`/api/${entityType}/${entity.id}`, { method: "DELETE" });
    window.location.href = `/${entityType}`;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Card className="max-w-lg w-full border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 relative">
        <CardHeader className="relative flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-amber-900 dark:text-amber-200 font-heading text-2xl">
              {entity[mainField]}
            </CardTitle>
            {descriptionField && (
              <CardDescription className="text-amber-800 dark:text-amber-400">
                {entity[descriptionField]}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2 absolute top-4 right-4">
            <Button
              size="icon"
              className="bg-amber-800 text-amber-100 hover:bg-amber-700"
              onClick={() => setEditOpen(true)}
              aria-label="Edit"
            >
              <Pencil className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="bg-red-900 text-amber-100 hover:bg-red-800"
              onClick={() => setDeleteOpen(true)}
              aria-label="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        {imageField && entity[imageField] && (
          <div className="mt-4 px-6">
            <img
              src={entity[imageField]}
              alt={entity[mainField]}
              className="w-full max-w-md mx-auto h-64 object-cover rounded border border-amber-800/30"
            />
          </div>
        )}
        {/* NPC Preview Section */}
        {config.label === 'NPCs' && config.preview?.enabled && (
          <div className="px-6 pt-8 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              {config.preview.fields.map((field: any) => (
                <div key={field.name} className="flex flex-col">
                  <span className="text-base font-semibold text-amber-700 dark:text-amber-400 mb-1">{field.label}</span>
                  <span className="text-xl text-amber-900 dark:text-amber-200 break-words">
                    {entity[field.name] || <span className="text-amber-400">—</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <CardContent className="text-amber-900 dark:text-amber-200 space-y-2">
          {/* Optionally render more fields here */}
        </CardContent>
        <GenericEntityForm
          open={editOpen}
          setOpen={setEditOpen}
          config={fullConfig}
          onCreated={() => window.location.reload()}
          campaigns={campaigns}
          entity={entity}
          availableLocations={config.label === 'NPCs' ? campaignLocations : undefined}
        />
        {/* Delete Modal */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="bg-parchment-light dark:bg-stone-800 border-amber-800/20">
            <DialogHeader>
              <DialogTitle className="text-amber-900 dark:text-amber-200">
                Delete {config.label.slice(0, -1)}
              </DialogTitle>
            </DialogHeader>
            <p className="text-amber-800 dark:text-amber-400 mb-4">
              Are you sure you want to delete "{entity.title || entity.name}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="text-amber-900 dark:text-amber-200 border-amber-800/30">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
} 