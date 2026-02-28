"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { PostCard } from "@/components/post-card"
import { EditProfileModal } from "@/components/edit-profile-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Settings,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

const tabs = ["Posts", "Media", "Likes"]

interface ProfileUser {
  id: string
  name: string
  username: string
  email: string
  avatar_url: string
  avatar: string
  cover_url: string
  cover: string
  bio: string
  location: string
  website: string
  is_online: boolean
  followers_count: number
  following_count: number
  posts_count: number
  joinedAt: string
  isFollowing: boolean
  isOwnProfile: boolean
}

interface ProfilePost {
  id: string
  content: string
  image: string | null
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
  author: {
    id: string
    name: string
    username: string
    avatar: string
  }
}

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { data: session } = useSession()

  const [user, setUser] = useState<ProfileUser | null>(null)
  const [posts, setPosts] = useState<ProfilePost[]>([])
  const [activeTab, setActiveTab] = useState("Posts")
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [error, setError] = useState("")

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/profile/${username}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Không thể tải profile")
        return
      }

      setUser(data.user)
      setPosts(data.posts)
    } catch {
      setError("Đã xảy ra lỗi kết nối")
    } finally {
      setIsLoading(false)
    }
  }, [username])

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username, fetchProfile])

  const handleFollow = async () => {
    if (!user) return
    setIsFollowLoading(true)

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id }),
      })

      const data = await res.json()

      if (res.ok) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: data.action === "followed",
                followers_count:
                  data.action === "followed"
                    ? prev.followers_count + 1
                    : prev.followers_count - 1,
              }
            : null
        )
      }
    } catch {
      // silently fail
    } finally {
      setIsFollowLoading(false)
    }
  }

  const formatCreatedAt = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return "just now"
      if (mins < 60) return `${mins}m ago`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      if (days < 7) return `${days}d ago`
      return format(new Date(dateStr), "MMM d")
    } catch {
      return dateStr
    }
  }

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "Media") return post.image !== null
    if (activeTab === "Likes") return post.isLiked
    return true // "Posts" tab shows all
  })

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  if (error || !user) {
    return (
      <AppShell>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">
            {error || "Không tìm thấy người dùng"}
          </p>
          <Link href="/">
            <Button variant="outline" className="rounded-full">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/"
          className="rounded-full p-1.5 transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <div>
          <h1
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {user.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {user.posts_count} posts
          </p>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-48 w-full bg-secondary">
        {user.cover_url && user.cover_url !== "/images/default-cover.jpg" ? (
          <Image
            src={user.cover_url}
            alt="Cover"
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-primary/30 via-primary/20 to-accent/30" />
        )}
      </div>

      {/* Profile Info */}
      <div className="relative border-b border-border bg-card px-4 pb-4">
        <div className="flex items-end justify-between">
          <Avatar className="-mt-16 h-28 w-28 border-4 border-card">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback className="text-2xl">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2 pt-3">
            {user.isOwnProfile ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  className="rounded-full px-5"
                  onClick={() => setShowEditModal(true)}
                >
                  Chỉnh sửa
                </Button>
              </>
            ) : (
              <Button
                variant={user.isFollowing ? "outline" : "default"}
                className="rounded-full px-5 gap-2"
                onClick={handleFollow}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : user.isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4" />
                    Đang theo dõi
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Theo dõi
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {user.name}
          </h2>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>

        {user.bio && (
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            {user.bio}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {user.location}
            </span>
          )}
          {user.website && (
            <a
              href={
                user.website.startsWith("http")
                  ? user.website
                  : `https://${user.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              {user.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {user.joinedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {format(new Date(user.joinedAt), "MMMM yyyy")}
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-foreground">
            <strong>{user.following_count.toLocaleString()}</strong>{" "}
            <span className="text-muted-foreground">Following</span>
          </span>
          <span className="text-foreground">
            <strong>{user.followers_count.toLocaleString()}</strong>{" "}
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
              "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer",
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
        {filteredPosts.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {activeTab === "Media"
                ? "Chưa có bài viết với ảnh"
                : activeTab === "Likes"
                  ? "Chưa thích bài viết nào"
                  : "Chưa có bài viết nào"}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                createdAt: formatCreatedAt(post.createdAt),
                author: {
                  ...post.author,
                  followers: 0,
                  following: 0,
                },
              }}
            />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {user.isOwnProfile && (
        <EditProfileModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          user={user}
          onSaved={fetchProfile}
        />
      )}
    </AppShell>
  )
}
