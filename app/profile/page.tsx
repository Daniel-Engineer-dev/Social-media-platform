"use client"

import { useState } from "react"
import Image from "next/image"
import { AppShell } from "@/components/app-shell"
import { PostCard } from "@/components/post-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { currentUser, posts } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Settings,
} from "lucide-react"
import Link from "next/link"

const tabs = ["Posts", "Replies", "Media", "Likes"]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Posts")

  const userPosts = posts.slice(0, 3)

  return (
    <AppShell>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
        <Link href="/" className="rounded-full p-1.5 transition-colors hover:bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {currentUser.name}
          </h1>
          <p className="text-xs text-muted-foreground">{userPosts.length} posts</p>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-48 w-full bg-secondary">
        <Image
          src="/images/cover.jpg"
          alt="Cover"
          fill
          className="object-cover"
        />
      </div>

      {/* Profile Info */}
      <div className="relative border-b border-border bg-card px-4 pb-4">
        <div className="flex items-end justify-between">
          <Avatar className="-mt-16 h-28 w-28 border-4 border-card">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="text-2xl">{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2 pt-3">
            <Button variant="outline" size="icon" className="rounded-full">
              <Settings className="h-4 w-4" />
            </Button>
            <Button className="rounded-full px-5">Edit Profile</Button>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {currentUser.name}
          </h2>
          <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-foreground">
          {currentUser.bio}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Ho Chi Minh City
          </span>
          <span className="flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5" />
            <span className="text-primary">minhtran.dev</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Joined March 2024
          </span>
        </div>

        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-foreground">
            <strong>{currentUser.following.toLocaleString()}</strong>{" "}
            <span className="text-muted-foreground">Following</span>
          </span>
          <span className="text-foreground">
            <strong>{currentUser.followers.toLocaleString()}</strong>{" "}
            <span className="text-muted-foreground">Followers</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
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

      {/* Posts */}
      <div>
        {userPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </AppShell>
  )
}
