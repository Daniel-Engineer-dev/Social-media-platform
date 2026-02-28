"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ProfileRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (session?.user?.id) {
      // Fetch username from session user id, then redirect
      fetch(`/api/profile/me`)
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            router.replace(`/profile/${data.username}`)
          } else {
            router.replace("/")
          }
        })
        .catch(() => router.replace("/"))
    } else {
      router.replace("/auth")
    }
  }, [session, status, router])

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
