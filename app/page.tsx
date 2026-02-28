"use client"

import { AppShell } from "@/components/app-shell"
import { StoryBar } from "@/components/story-bar"
import { ComposeBox } from "@/components/compose-box"
import { PostCard } from "@/components/post-card"
import { posts } from "@/lib/mock-data"

export default function HomePage() {
  return (
    <AppShell>
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Home
          </h1>
        </div>
        <div className="flex border-b border-border">
          <button className="flex-1 border-b-2 border-primary py-3 text-sm font-semibold text-primary">
            For You
          </button>
          <button className="flex-1 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Following
          </button>
        </div>
      </div>

      <StoryBar />
      <ComposeBox />

      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </AppShell>
  )
}
