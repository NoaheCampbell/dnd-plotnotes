"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Campaign } from "@/types"

interface LocationEditFormProps {
  location: {
    id: number
    name: string
    type: string | null
    description: string | null
    map_url: string | null
    campaign_id: number | null
  }
  campaigns: Campaign[]
}

export default function LocationEditForm({ location, campaigns }: LocationEditFormProps) {
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
      description: formData.get("description"),
      map_url: formData.get("map_url"),
    }

    try {
      const response = await fetch(`/api/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update location")
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
        <Select name="campaign_id" defaultValue={location.campaign_id?.toString() || ""}>
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
          defaultValue={location.name}
          required
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Input
          id="type"
          name="type"
          defaultValue={location.type || ""}
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={location.description || ""}
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="map_url">Map URL</Label>
        <Input
          id="map_url"
          name="map_url"
          defaultValue={location.map_url || ""}
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