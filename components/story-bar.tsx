"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { stories, currentUser } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

export function StoryBar() {
  return (
    <div className="border-b border-border bg-card px-4 py-4">
      <ScrollArea className="w-full">
        <div className="flex gap-4">
          {stories.map((story, index) => {
            const isOwn = story.user.id === currentUser.id
            return (
              <button
                key={story.id}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div
                  className={cn(
                    "relative rounded-full p-[2px]",
                    story.hasNew
                      ? "bg-primary"
                      : index === 0
                      ? "bg-border"
                      : "bg-border"
                  )}
                >
                  <Avatar className="h-14 w-14 border-2 border-card">
                    <AvatarImage src={story.user.avatar} alt={story.user.name} />
                    <AvatarFallback>{story.user.name[0]}</AvatarFallback>
                  </Avatar>
                  {isOwn && (
                    <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                      <Plus className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <span className="max-w-[68px] truncate text-xs text-muted-foreground">
                  {isOwn ? "Your story" : story.user.name.split(" ")[0]}
                </span>
              </button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
