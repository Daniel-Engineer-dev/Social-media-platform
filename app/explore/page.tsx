"use client"

import { useState } from "react"
import Image from "next/image"
import { AppShell } from "@/components/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { users, trendingTopics, posts } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Search, TrendingUp, Users, ImageIcon, Hash } from "lucide-react"

const categories = ["For You", "Trending", "News", "Sports", "Entertainment"]

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("For You")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <AppShell showRightSidebar={false}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search topics, people, or posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full border-border bg-secondary pl-10 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto border-b border-border px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 px-4 py-3 text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "border-b-2 border-primary text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Grid */}
      <div className="border-b border-border p-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {posts
            .filter((p) => p.image)
            .map((post) => (
              <button
                key={post.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"
              >
                <Image
                  src={post.image!}
                  alt="Explore"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/20" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Avatar className="h-6 w-6 border border-card">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback className="text-[10px]">{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-card">{post.author.name}</span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="border-b border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Topics
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {trendingTopics.map((topic, index) => (
            <button
              key={topic.tag}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{topic.tag}</p>
                <p className="text-xs text-muted-foreground">{topic.posts}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* People to Discover */}
      <div className="bg-card p-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          <Users className="h-5 w-5 text-primary" />
          People to Discover
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary"
            >
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {user.followers.toLocaleString()} followers
                </p>
              </div>
              <Button
                variant={user.isFollowing ? "secondary" : "default"}
                size="sm"
                className="shrink-0 rounded-full text-xs"
              >
                {user.isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
