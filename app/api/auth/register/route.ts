import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng" },
        { status: 409 }
      )
    }

    // Generate username from email
    let username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
    
    // Check if username exists, if so add random suffix
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUsername) {
      username = `${username}${Math.floor(Math.random() * 9999)}`
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password_hash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar_url: true,
        created_at: true,
      },
    })

    return NextResponse.json(
      { message: "Đăng ký thành công!", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi, vui lòng thử lại sau" },
      { status: 500 }
    )
  }
}
