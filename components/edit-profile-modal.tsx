"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Camera, Loader2 } from "lucide-react"

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    name: string
    bio: string
    location: string
    website: string
    avatar_url: string
    cover_url: string
  }
  onSaved: () => void
}

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  onSaved,
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    avatar_url: user.avatar_url || "",
    cover_url: user.cover_url || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Cập nhật thất bại")
        setIsLoading(false)
        return
      }

      onSaved()
      onOpenChange(false)
    } catch {
      setError("Đã xảy ra lỗi, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Chỉnh sửa hồ sơ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Cover Image Preview */}
          <div className="relative mx-4 mt-2 h-32 overflow-hidden rounded-xl bg-secondary">
            {formData.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.cover_url}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Camera className="h-6 w-6 text-white/80" />
            </div>
          </div>

          {/* Avatar Preview */}
          <div className="relative -mt-10 ml-8 w-fit">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={formData.avatar_url} alt={formData.name} />
              <AvatarFallback className="text-xl">
                {formData.name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
              <Camera className="h-4 w-4 text-white/80" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 px-4 pt-3 pb-4">
            {/* Avatar URL */}
            <div className="space-y-1.5">
              <Label htmlFor="avatar_url" className="text-xs text-muted-foreground">
                URL Ảnh đại diện
              </Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => updateField("avatar_url", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="rounded-lg border-border bg-secondary/50 text-sm"
              />
            </div>

            {/* Cover URL */}
            <div className="space-y-1.5">
              <Label htmlFor="cover_url" className="text-xs text-muted-foreground">
                URL Ảnh bìa
              </Label>
              <Input
                id="cover_url"
                value={formData.cover_url}
                onChange={(e) => updateField("cover_url", e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="rounded-lg border-border bg-secondary/50 text-sm"
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                Tên hiển thị
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                maxLength={50}
                className="rounded-lg border-border bg-secondary/50 text-sm"
                required
              />
              <p className="text-right text-[11px] text-muted-foreground">
                {formData.name.length}/50
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs text-muted-foreground">
                Tiểu sử
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                maxLength={160}
                rows={3}
                className="resize-none rounded-lg border-border bg-secondary/50 text-sm"
                placeholder="Giới thiệu về bạn..."
              />
              <p className="text-right text-[11px] text-muted-foreground">
                {formData.bio.length}/160
              </p>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs text-muted-foreground">
                Vị trí
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Ho Chi Minh City"
                className="rounded-lg border-border bg-secondary/50 text-sm"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs text-muted-foreground">
                Website
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://yourwebsite.com"
                className="rounded-lg border-border bg-secondary/50 text-sm"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full rounded-xl py-5 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
