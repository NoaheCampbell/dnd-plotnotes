"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"

export function ShowInactiveToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    setShowInactive(searchParams.get("showInactive") === "true")
  }, [searchParams])

  const handleToggle = (checked: boolean) => {
    setShowInactive(checked)
    const url = new URL(window.location.href)
    if (checked) {
      url.searchParams.set("showInactive", "true")
    } else {
      url.searchParams.delete("showInactive")
    }
    // Use shallow routing to avoid full reload
    router.push(url.pathname + url.search, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="show-inactive"
        checked={showInactive}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="show-inactive" className="text-amber-900 dark:text-amber-200">
        Show Inactive
      </Label>
    </div>
  )
} 