"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Campaign } from "@/types"

interface ItemEditFormProps {
  item: {
    id: number
    name: string
    type: string | null
    rarity: string | null
    image_url: string | null
    campaign_id: number | null
  }
  campaigns: Campaign[]
}

export default function ItemEditForm({ item, campaigns }: ItemEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      campaign_id: formData.get("campaign_id"),
      name: formData.get("name"),
      type: formData.get("type"),
      rarity: formData.get("rarity"),
      image_url: formData.get("image_url"),
    }

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update item")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="campaign_id">Campaign</Label>
        <Select name="campaign_id" defaultValue={item.campaign_id?.toString() || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select a campaign" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id.toString()}>
                {campaign.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={item.name}
          required
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Input
          id="type"
          name="type"
          defaultValue={item.type || ""}
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rarity">Rarity</Label>
        <Input
          id="rarity"
          name="rarity"
          defaultValue={item.rarity || ""}
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          defaultValue={item.image_url || ""}
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-red-900 hover:bg-red-800 text-amber-100"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
} 