"use client"

import { AppShell } from "@/components/app-shell"
import { PostCard } from "@/components/post-card"
import { posts } from "@/lib/mock-data"
import { Bookmark } from "lucide-react"

export default function BookmarksPage() {
  const bookmarkedPosts = posts.filter((p) => p.isBookmarked)

  return (
    <AppShell>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Bookmarks
        </h1>
        <p className="text-xs text-muted-foreground">@minhtran</p>
      </div>

      {/* Bookmarked Posts */}
      {bookmarkedPosts.length > 0 ? (
        <div>
          {bookmarkedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-8 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Bookmark className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Save posts for later
          </h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Bookmark posts to easily find them again in the future.
          </p>
        </div>
      )}
    </AppShell>
  )
}
