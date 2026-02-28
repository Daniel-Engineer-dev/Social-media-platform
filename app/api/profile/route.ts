import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, bio, location, website, avatar_url, cover_url } = body

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Tên không được để trống" },
        { status: 400 }
      )
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "Tên không được quá 50 ký tự" },
        { status: 400 }
      )
    }

    if (bio && bio.length > 160) {
      return NextResponse.json(
        { error: "Bio không được quá 160 ký tự" },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        bio: bio?.trim() ?? "",
        location: location?.trim() ?? "",
        website: website?.trim() ?? "",
        ...(avatar_url !== undefined && { avatar_url }),
        ...(cover_url !== undefined && { cover_url }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar_url: true,
        cover_url: true,
        bio: true,
        location: true,
        website: true,
      },
    })

    return NextResponse.json({
      message: "Cập nhật thành công!",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    )
  }
}
