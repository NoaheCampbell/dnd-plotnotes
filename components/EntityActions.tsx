"use client"

import { useState } from "react"
import GenericEntityForm from "@/components/generic-entity-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { getFullEntityConfig } from "@/lib/get-full-entity-config"

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
  editOpen: boolean
  setEditOpen: (open: boolean) => void
  deleteOpen: boolean
  setDeleteOpen: (open: boolean) => void
  deleting: boolean
  setDeleting: (deleting: boolean) => void
}

export default function EntityActions({ entity, campaigns = [], config, apiPath, onDeleted, editOpen, setEditOpen, deleteOpen, setDeleteOpen, deleting, setDeleting }: EntityActionsProps) {
  // Use shared utility for full config
  const fullConfig = getFullEntityConfig(config, apiPath, campaigns)

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
      <GenericEntityForm
        open={editOpen}
        setOpen={setEditOpen}
        config={fullConfig}
        onCreated={() => window.location.reload()}
        campaigns={campaigns}
        entity={entity}
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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 