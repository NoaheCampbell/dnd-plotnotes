"use client"

import { useState } from "react"
import GenericEntityEditModal from "@/components/generic-entity-edit-modal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"

interface EntityActionsProps {
  entity: any
  campaigns?: any[]
  config: {
    label: string
    fields: {
      name: string
      label: string
      type: string
      required?: boolean
      options?: { value: any; label: string }[]
    }[]
  }
  apiPath: string
  onDeleted?: () => void
}

export default function EntityActions({ entity, campaigns = [], config, apiPath, onDeleted }: EntityActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Add campaign_id field to config if it doesn't exist
  const fullConfig = {
    ...config,
    api: `/api${apiPath}`,
    fields: [
      // Only add campaign_id select if not editing a campaign itself
      ...(config.label !== "Campaigns"
        ? [{
            name: "campaign_id",
            label: "Campaign",
            type: "select",
            required: true,
            options: campaigns.map(c => ({ value: c.id, label: c.title }))
          }]
        : []),
      ...config.fields,
      // Only add the image field if not already present
      ...(!config.fields.some(f => f.name === "image")
        ? [{ name: "image", label: "Image", type: "file" }]
        : [])
    ]
  }

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api${apiPath}/${entity.id}`, { method: "DELETE" })
    setDeleting(false)
    setDeleteOpen(false)
    if (onDeleted) onDeleted()
    else {
      // Redirect to the entity list page based on fullConfig.api, using /entities/[entity]
      let entityListPath = "/";
      if (fullConfig.api) {
        const match = fullConfig.api.match(/^\/api\/(\w+)/);
        if (match) {
          entityListPath = `/entities/${match[1]}`;
        }
      }
      window.location.href = entityListPath;
    }
  }

  return (
    <>
      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => setEditOpen(true)}
          className="bg-amber-800 text-amber-100 hover:bg-amber-700"
        >
          Edit
        </Button>
        <Button
          onClick={() => setDeleteOpen(true)}
          className="bg-red-900 text-amber-100 hover:bg-red-800"
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
      <GenericEntityEditModal
        open={editOpen}
        setOpen={setEditOpen}
        config={fullConfig}
        entity={entity}
        onEdited={() => window.location.reload()}
      />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-parchment-light dark:bg-stone-800 border-amber-800/20">
          <DialogHeader>
            <DialogTitle className="text-amber-900 dark:text-amber-200">Delete {config.label.slice(0, -1)}</DialogTitle>
            <DialogDescription className="text-amber-800 dark:text-amber-400">
              Are you sure you want to delete "{entity.title || entity.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="text-amber-900 dark:text-amber-200 border-amber-800/30">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDelete} className="bg-red-900 hover:bg-red-800 text-amber-100" disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 