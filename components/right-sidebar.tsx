"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { users, trendingTopics } from "@/lib/mock-data"
import { Search, TrendingUp } from "lucide-react"

export function RightSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[340px] shrink-0 overflow-y-auto border-l border-border bg-card p-4 xl:block">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search Vibe..."
          className="rounded-full border-border bg-secondary pl-10 text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Trending */}
      <div className="mb-6 rounded-xl border border-border bg-secondary/50 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          <TrendingUp className="h-4 w-4 text-primary" />
          Trending Now
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          {trendingTopics.map((topic) => (
            <button
              key={topic.tag}
              className="flex items-center justify-between text-left transition-colors hover:opacity-80"
            >
              <div>
                <p className="text-sm font-medium text-primary">{topic.tag}</p>
                <p className="text-xs text-muted-foreground">{topic.posts}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Who to Follow */}
      <div className="rounded-xl border border-border bg-secondary/50 p-4">
        <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Who to follow
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          {users
            .filter((u) => !u.isFollowing)
            .slice(0, 3)
            .map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full text-xs"
                >
                  Follow
                </Button>
              </div>
            ))}
        </div>
        <button className="mt-3 text-sm font-medium text-primary hover:underline">
          Show more
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>Terms of Service</span>
        <span>Privacy Policy</span>
        <span>Cookie Policy</span>
        <span>Accessibility</span>
        <span>Ads info</span>
        <span>More</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Vibe, Inc. 2026</p>
    </aside>
  )
}
