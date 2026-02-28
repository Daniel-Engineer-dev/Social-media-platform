import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Thiếu thông tin người dùng" },
        { status: 400 }
      )
    }

    // Can't follow yourself
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "Không thể tự follow chính mình" },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      )
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: session.user.id,
          following_id: targetUserId,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      })

      return NextResponse.json({
        action: "unfollowed",
        message: `Đã hủy theo dõi ${targetUser.name}`,
      })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          follower_id: session.user.id,
          following_id: targetUserId,
        },
      })

      return NextResponse.json({
        action: "followed",
        message: `Đã theo dõi ${targetUser.name}`,
      })
    }
  } catch (error) {
    console.error("Follow API error:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    )
  }
}
