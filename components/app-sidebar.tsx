"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Compass,
  Dice1Icon as Dice,
  Menu,
  PenTool,
  Settings,
  Skull,
  Users,
  Clock,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/sidebar-provider"

const sidebarLinks = [
  {
    title: "Grimoire",
    href: "/",
    icon: BookOpen,
  },
  {
    title: "Campaigns",
    href: "/entities/campaigns",
    icon: BookOpen,
    color: "text-amber-200",
  },
  {
    title: "Sessions",
    href: "/entities/sessions",
    icon: Calendar,
    color: "text-amber-200",
  },
  {
    title: "NPCs",
    href: "/entities/npcs",
    icon: Users,
    color: "text-amber-200",
  },
  {
    title: "Locations",
    href: "/entities/locations",
    icon: Compass,
    color: "text-amber-200",
  },
  {
    title: "Encounters",
    href: "/entities/encounters",
    icon: Skull,
    color: "text-amber-200",
  },
  {
    title: "Items",
    href: "/entities/items",
    icon: Dice,
    color: "text-amber-200",
  },
  {
    title: "Notes",
    href: "/entities/notes",
    icon: PenTool,
    color: "text-amber-200",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    color: "text-amber-200",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-amber-800/30 bg-parchment-dark px-4 sm:px-6 lg:px-8 md:hidden dark:bg-stone-800 dark:border-amber-800/20">
        <Button variant="outline" size="icon" onClick={toggle} className="border-amber-800/30 dark:border-amber-600/30">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex items-center gap-x-2">
          <div className="h-8 w-8 rounded-full bg-red-900 flex items-center justify-center">
            <Dice className="h-5 w-5 text-amber-200" />
          </div>
          <span className="font-heading font-bold text-xl text-amber-900 dark:text-amber-200">PlotNotes</span>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 md:relative md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "border-r border-amber-800/30 bg-parchment-dark dark:bg-stone-800 dark:border-amber-800/20",
        )}
      >
        <div className="flex h-16 items-center gap-x-3 border-b border-amber-800/30 px-6 dark:border-amber-800/20">
          <div className="h-8 w-8 rounded-full bg-red-900 flex items-center justify-center">
            <Dice className="h-5 w-5 text-amber-200" />
          </div>
          <span className="font-heading font-bold text-xl text-amber-900 dark:text-amber-200">PlotNotes</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden text-amber-900 hover:text-amber-800 hover:bg-amber-100/20 dark:text-amber-200 dark:hover:bg-amber-900/20"
            onClick={toggle}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-2">
            {sidebarLinks.map((link) => (
              <Button
                key={link.href}
                variant={pathname === link.href ? "secondary" : "ghost"}
                className={cn(
                  "justify-start gap-3 px-3 text-amber-200 hover:bg-amber-100/20 dark:hover:bg-amber-900/20",
                  pathname === link.href &&
                    "bg-amber-100/30 text-amber-900 hover:bg-amber-100/30 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/30",
                )}
                asChild
              >
                <Link href={link.href}>
                  <link.icon className={cn("h-5 w-5", link.color)} />
                  <span className="font-medium">{link.title}</span>
                </Link>
              </Button>
            ))}
          </nav>

          <Separator className="my-4 bg-amber-800/30 dark:bg-amber-800/20" />

          <div className="px-4">
            <h4 className="mb-2 text-xs font-semibold text-amber-800 dark:text-amber-400">ACTIVE QUESTS</h4>
            {/* TODO: Add active quests */}
          </div>
        </ScrollArea>

        <div className="border-t border-amber-800/30 p-4 dark:border-amber-800/20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-red-900/80 flex items-center justify-center">
              <span className="font-medium text-amber-200">DM</span>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-200">Dungeon Master</p>
              <p className="text-xs text-amber-800 dark:text-amber-400">Archmage Tier</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
