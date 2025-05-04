"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Campaign } from "@/types"

interface EncounterEditFormProps {
  encounter: {
    id: number
    title: string
    difficulty: string | null
    location: string | null
    creatures: number | null
    campaign_id: number | null
  }
  campaigns: Campaign[]
}

export default function EncounterEditForm({ encounter, campaigns }: EncounterEditFormProps) {
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
      title: formData.get("title"),
      difficulty: formData.get("difficulty"),
      location: formData.get("location"),
      creatures: formData.get("creatures"),
    }

    try {
      const response = await fetch(`/api/encounters/${encounter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update encounter")
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
        <Select name="campaign_id" defaultValue={encounter.campaign_id?.toString() || ""}>
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
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={encounter.title}
          required
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty</Label>
        <Input
          id="difficulty"
          name="difficulty"
          defaultValue={encounter.difficulty || ""}
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={encounter.location || ""}
          className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-800/30 text-amber-900 dark:text-amber-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="creatures">Number of Creatures</Label>
        <Input
          id="creatures"
          name="creatures"
          type="number"
          defaultValue={encounter.creatures || ""}
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