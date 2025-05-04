"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import GenericEntityEditModal from "./generic-entity-edit-modal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface GenericEntityActionsProps {
  entity: any
  config: {
    label: string
    api: string
    fields: Array<{
      name: string
      label: string
      type: string
      required?: boolean
    }>
  }
  onEdited: (item: any) => void
  onDeleted?: () => void
}

export default function GenericEntityActions({ entity, config, onEdited, onDeleted }: GenericEntityActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch(`${config.api}/${entity.id}`, {
      method: "DELETE",
    })
    setLoading(false)
    if (res.ok) {
      setDeleteOpen(false)
      onDeleted?.()
    } else {
      alert(`Failed to delete ${config.label.slice(0, -1)}`)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditOpen(true)}
          className="text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteOpen(true)}
          className="text-red-900 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <GenericEntityEditModal
        open={editOpen}
        setOpen={setEditOpen}
        config={config}
        entity={entity}
        onEdited={onEdited}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-parchment-light dark:bg-stone-800 border-amber-800/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-900 dark:text-amber-200">
              Delete {config.label.slice(0, -1)}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-amber-800 dark:text-amber-400">
              Are you sure you want to delete "{entity.title || entity.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-amber-900 dark:text-amber-200 border-amber-800/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-900 hover:bg-red-800 text-amber-100"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 