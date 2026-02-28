"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  PlusCircle,
  Settings,
  Bookmark,
  TrendingUp,
  Clapperboard,
  Sun,
  Moon,
  Monitor,
  Check,
  LogOut,
} from "lucide-react"
import Image from "next/image"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: 3 },
  { href: "/messages", label: "Messages", icon: Mail, badge: 2 },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/threels", label: "Threel", icon: Clapperboard },
  { href: "/profile", label: "Profile", icon: User, dynamic: true },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [isExpanded, setIsExpanded] = useState(false)
  const [userData, setUserData] = useState<{ name: string; username: string; avatar_url: string } | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/profile/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.username) setUserData(data)
        })
        .catch(() => {})
    }
  }, [session?.user?.id])

  const displayName = userData?.name || session?.user?.name || "User"
  const displayUsername = userData?.username || "user"
  const displayAvatar = userData?.avatar_url || session?.user?.image || "/images/default-avatar.jpg"

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-border bg-card py-6 transition-all duration-300 ease-in-out overflow-hidden z-40",
        isExpanded
          ? "w-[260px] items-start px-4"
          : "w-[72px] items-center"
      )}
    >
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2 px-3">
        <Image src="/Logo.png" alt="Logo" width={40} height={40} className="rounded-lg brightness-150 shrink-0"/>
        <span
          className={cn(
            "text-xl font-bold text-foreground whitespace-nowrap transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 w-0"
          )}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Daniel Social
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 w-full">
        {navItems.map((item) => {
          const href = item.dynamic && userData ? `/profile/${userData.username}` : item.href
          const isActive = item.dynamic ? pathname.startsWith("/profile") : pathname === item.href
          return (
            <Link
              key={item.href}
              href={href}
              title={!isExpanded ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors w-full",
                isExpanded ? "justify-start" : "justify-center",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-300",
                  isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                )}
              >
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground",
                    isExpanded
                      ? "relative ml-auto"
                      : "absolute right-1 top-0.5"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Compose Button */}
      <Button
        className={cn(
          "mb-4 mt-4 rounded-xl transition-all duration-300",
          isExpanded ? "w-full" : "w-[48px]"
        )}
        size="lg"
      >
        <PlusCircle className={cn("h-5 w-5 shrink-0", isExpanded && "mr-2")} />
        <span
          className={cn(
            "whitespace-nowrap transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
          )}
        >
          New Post
        </span>
      </Button>

      {/* User Profile & Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback>{displayName[0]}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "flex-1 overflow-hidden transition-opacity duration-300",
                isExpanded ? "opacity-100 block" : "opacity-0 hidden"
              )}
            >
              <p className="truncate text-sm font-semibold text-foreground text-left">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground text-left">@{displayUsername}</p>
            </div>
            <Settings
              className={cn(
                "h-4 w-4 text-muted-foreground transition-opacity duration-300",
                isExpanded ? "opacity-100 block" : "opacity-0 hidden"
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Theme</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light
            </span>
            {theme === "light" && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dark
            </span>
            {theme === "dark" && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              System
            </span>
            {theme === "system" && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ redirectTo: "/auth" })}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  )
}
