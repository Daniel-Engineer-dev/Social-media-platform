"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { MobileNav } from "@/components/mobile-nav"

interface AppShellProps {
  children: React.ReactNode
  showRightSidebar?: boolean
}

export function AppShell({ children, showRightSidebar = true }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </main>

      {/* Right Sidebar */}
      {showRightSidebar && <RightSidebar />}

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  )
}
