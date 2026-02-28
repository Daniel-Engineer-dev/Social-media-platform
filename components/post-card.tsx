"use client"

import { useState } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Post } from "@/lib/mock-data"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [bookmarked, setBookmarked] = useState(post.isBookmarked)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  return (
    <article className="border-b border-border bg-card px-4 py-4 transition-colors hover:bg-card/80">
      <div className="flex gap-3">
        {/* Author Avatar */}
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={post.author.avatar} alt={post.author.name} />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {post.author.name}
              </span>
              <span className="text-sm text-muted-foreground">
                @{post.author.username}
              </span>
              <span className="text-sm text-muted-foreground">
                {"  "}
                {post.createdAt}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {post.content}
          </p>

          {/* Image */}
          {post.image && (
            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <Image
                src={post.image}
                alt="Post image"
                width={600}
                height={400}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
                  liked
                    ? "text-red-500 bg-red-50"
                    : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                )}
              >
                <Heart
                  className={cn("h-4 w-4", liked && "fill-current")}
                />
                <span>{likeCount}</span>
              </button>

              <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-primary hover:bg-primary/10">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </button>

              <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-accent hover:bg-accent/10">
                <Share2 className="h-4 w-4" />
                <span>{post.shares}</span>
              </button>
            </div>

            <button
              onClick={handleBookmark}
              className={cn(
                "rounded-full p-1.5 transition-colors",
                bookmarked
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Bookmark
                className={cn("h-4 w-4", bookmarked && "fill-current")}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
