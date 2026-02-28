"use client"

import { AppShell } from "@/components/app-shell"
import { PostCard } from "@/components/post-card"
import { trendingTopics, posts } from "@/lib/mock-data"
import { TrendingUp, Flame } from "lucide-react"

export default function TrendingPage() {
  return (
    <AppShell>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="flex items-center gap-2 text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending
        </h1>
      </div>

      {/* Trending Topics */}
      <div className="border-b border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider">
          <Flame className="h-4 w-4 text-destructive" />
          Hot Topics
        </h2>
        <div className="mt-3 flex flex-col gap-1">
          {trendingTopics.map((topic, index) => (
            <button
              key={topic.tag}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-secondary"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{topic.tag}</p>
                <p className="text-xs text-muted-foreground">{topic.posts}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trending Posts */}
      <div>
        <div className="px-4 py-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Trending Posts
          </h2>
        </div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </AppShell>
  )
}
