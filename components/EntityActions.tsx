"use client"

import { useState } from "react"
import GenericEntityEditModal from "@/components/generic-entity-edit-modal"
import { Button } from "@/components/ui/button"

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

  // Add campaign_id field to config if it doesn't exist
  const fullConfig = {
    ...config,
    api: `/api${apiPath}`,
    fields: [
      {
        name: "campaign_id",
        label: "Campaign",
        type: "select",
        required: true,
        options: campaigns.map(c => ({ value: c.id, label: c.title }))
      },
      ...config.fields,
      {
        name: "image",
        label: "Image",
        type: "file"
      }
    ]
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this?")) return
    setDeleting(true)
    await fetch(`/api${apiPath}/${entity.id}`, { method: "DELETE" })
    setDeleting(false)
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
          onClick={handleDelete}
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
    </>
  )
} 