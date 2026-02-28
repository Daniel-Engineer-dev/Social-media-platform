"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { messages, currentUser } from "@/lib/mock-data"
import type { Message } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Search, Settings, Edit, Send, Phone, Video, MoreHorizontal, ArrowLeft, ImageIcon, Smile } from "lucide-react"

const mockChatMessages = [
  { id: "c1", sender: "other", text: "Hey! Are you coming to the event tonight?", time: "5:30 PM" },
  { id: "c2", sender: "me", text: "Yes! I'll be there around 7. Can't wait!", time: "5:32 PM" },
  { id: "c3", sender: "other", text: "Perfect! I'll save you a seat. It's going to be amazing.", time: "5:33 PM" },
  { id: "c4", sender: "me", text: "Thanks! Should I bring anything?", time: "5:35 PM" },
  { id: "c5", sender: "other", text: "Just yourself and good vibes! See you there.", time: "5:36 PM" },
]

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<Message | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMessages = messages.filter((m) =>
    m.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppShell showRightSidebar={false}>
      <div className="flex h-screen">
        {/* Conversations List */}
        <div
          className={cn(
            "flex w-full flex-col border-r border-border bg-card md:w-[360px]",
            selectedChat ? "hidden md:flex" : "flex"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Messages
            </h1>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full border-border bg-secondary pl-10 text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedChat(message)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary",
                  selectedChat?.id === message.id && "bg-primary/5"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={message.user.avatar} alt={message.user.name} />
                    <AvatarFallback>{message.user.name[0]}</AvatarFallback>
                  </Avatar>
                  {message.user.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {message.user.name}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {message.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm text-muted-foreground">
                      {message.lastMessage}
                    </p>
                    {message.unread > 0 && (
                      <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {message.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "flex flex-1 flex-col bg-background",
            !selectedChat ? "hidden md:flex" : "flex"
          )}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="rounded-full p-1.5 transition-colors hover:bg-secondary md:hidden"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={selectedChat.user.avatar} alt={selectedChat.user.name} />
                  <AvatarFallback>{selectedChat.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{selectedChat.user.name}</p>
                  <p className="text-xs text-accent">
                    {selectedChat.user.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-3">
                  {mockChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender === "me" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2.5",
                          msg.sender === "me"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-foreground"
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            msg.sender === "me"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-muted-foreground">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 rounded-full border-border bg-secondary text-sm placeholder:text-muted-foreground"
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Edit className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-2 text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                Your Messages
              </h2>
              <p className="text-center text-sm text-muted-foreground">
                Select a conversation to start chatting
              </p>
              <Button className="mt-3 rounded-full px-6">New Message</Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
