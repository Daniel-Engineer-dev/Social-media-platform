"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/mock-data"
import { ImageIcon, Smile, MapPin, BarChart3 } from "lucide-react"

export function ComposeBox() {
  const [content, setContent] = useState("")

  return (
    <div className="border-b border-border bg-card px-4 py-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] w-full resize-none border-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary">
                <MapPin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="sm"
              className="rounded-full px-5"
              disabled={!content.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
