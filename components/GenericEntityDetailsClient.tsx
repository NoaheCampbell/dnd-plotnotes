"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EntityActions from "@/components/EntityActions";
import { getFullEntityConfig } from "@/lib/get-full-entity-config";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function GenericEntityDetailsClient({ entity, config, apiPath, campaigns = [] }: {
  entity: any;
  config: any;
  apiPath: string;
  campaigns?: any[];
}) {
  const fullConfig = getFullEntityConfig(config, apiPath, campaigns);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Render main fields
  const mainField = config.fields[0]?.name;
  const descriptionField = config.descriptionField;
  const imageField = config.imageField;

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
          <Button
            size="icon"
            className="absolute top-4 right-4 bg-amber-800 text-amber-100 hover:bg-amber-700"
            onClick={() => setEditOpen(true)}
            aria-label="Edit"
          >
            <Pencil className="h-5 w-5" />
          </Button>
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
        <CardContent className="text-amber-900 dark:text-amber-200 space-y-2">
          {/* Optionally render more fields here */}
        </CardContent>
        <EntityActions
          entity={entity}
          config={fullConfig}
          apiPath={apiPath}
          editOpen={editOpen}
          setEditOpen={setEditOpen}
          deleteOpen={deleteOpen}
          setDeleteOpen={setDeleteOpen}
          deleting={deleting}
          setDeleting={setDeleting}
        />
      </Card>
    </div>
  );
} 