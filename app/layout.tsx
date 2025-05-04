import type React from "react"
import type { Metadata } from "next"
import { Cinzel_Decorative, Lora, Inter } from "next/font/google"
import "./globals.css"

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SettingsProvider } from "@/app/context/settings-context"

const fontHeading = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-heading",
})

const fontBody = Lora({
  subsets: ["latin"],
  variable: "--font-body",
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PlotNotes - D&D Campaign Management",
  description: "Plan, organize, and run your D&D campaigns with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen font-body antialiased", fontHeading.variable, fontBody.variable, inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SettingsProvider>
            <SidebarProvider>
              <div className="flex min-h-screen bg-parchment dark:bg-stone-900">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto">{children}</main>
              </div>
            </SidebarProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
