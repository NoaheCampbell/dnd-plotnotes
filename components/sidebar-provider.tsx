"use client"

import * as React from "react"

type SidebarContext = {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = React.createContext<SidebarContext | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true)

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  return <SidebarContext.Provider value={{ isOpen, toggle, close }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
