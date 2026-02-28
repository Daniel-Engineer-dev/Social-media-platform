"use client"

import { useState } from "react"
import Image from "next/image"
import { AppShell } from "@/components/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { notifications } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Heart, MessageCircle, UserPlus, AtSign, Settings } from "lucide-react"

const tabs = ["All", "Mentions"]

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
}

const colorMap = {
  like: "text-red-500 bg-red-50",
  comment: "text-primary bg-primary/10",
  follow: "text-accent bg-accent/10",
  mention: "text-amber-500 bg-amber-50",
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All")

  const filtered = activeTab === "Mentions"
    ? notifications.filter((n) => n.type === "mention")
    : notifications

  return (
    <AppShell>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Notifications
          </h1>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-b-2 border-primary text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Items */}
      <div>
        {filtered.map((notif) => {
          const Icon = iconMap[notif.type]
          return (
            <button
              key={notif.id}
              className={cn(
                "flex w-full items-start gap-3 border-b border-border px-4 py-4 text-left transition-colors hover:bg-secondary/50",
                !notif.isRead && "bg-primary/5"
              )}
            >
              {/* Icon */}
              <div className={cn("mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colorMap[notif.type])}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={notif.user.avatar} alt={notif.user.name} />
                    <AvatarFallback>{notif.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{notif.user.name}</span>{" "}
                      <span className="text-muted-foreground">{notif.content}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{notif.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* Post Thumbnail */}
              {notif.postImage && (
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={notif.postImage}
                    alt="Post"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Follow Button */}
              {notif.type === "follow" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full text-xs"
                >
                  Follow back
                </Button>
              )}

              {/* Unread dot */}
              {!notif.isRead && (
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </AppShell>
  )
}
