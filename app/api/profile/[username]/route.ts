import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const session = await auth()
    const currentUserId = session?.user?.id

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar_url: true,
        cover_url: true,
        bio: true,
        location: true,
        website: true,
        is_online: true,
        followers_count: true,
        following_count: true,
        posts_count: true,
        created_at: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      )
    }

    // Check if current user follows this profile
    let isFollowing = false
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: currentUserId,
            following_id: user.id,
          },
        },
      })
      isFollowing = !!follow
    }

    const isOwnProfile = currentUserId === user.id

    // Get user's posts
    const posts = await prisma.post.findMany({
      where: {
        author_id: user.id,
        deleted_at: null,
      },
      orderBy: { created_at: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
          },
        },
        media: {
          orderBy: { position: "asc" },
          take: 1,
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    // Check which posts the current user has liked/bookmarked
    let likedPostIds: string[] = []
    let bookmarkedPostIds: string[] = []

    if (currentUserId) {
      const [likes, bookmarks] = await Promise.all([
        prisma.like.findMany({
          where: {
            user_id: currentUserId,
            post_id: { in: posts.map((p) => p.id) },
          },
          select: { post_id: true },
        }),
        prisma.bookmark.findMany({
          where: {
            user_id: currentUserId,
            post_id: { in: posts.map((p) => p.id) },
          },
          select: { post_id: true },
        }),
      ])
      likedPostIds = likes.map((l) => l.post_id)
      bookmarkedPostIds = bookmarks.map((b) => b.post_id)
    }

    // Format posts for frontend
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      image: post.media[0]?.url || null,
      likes: post.likes_count,
      comments: post.comments_count,
      shares: post.shares_count,
      isLiked: likedPostIds.includes(post.id),
      isBookmarked: bookmarkedPostIds.includes(post.id),
      createdAt: post.created_at.toISOString(),
      author: {
        id: post.author.id,
        name: post.author.name,
        username: post.author.username,
        avatar: post.author.avatar_url,
      },
    }))

    return NextResponse.json({
      user: {
        ...user,
        avatar: user.avatar_url,
        cover: user.cover_url,
        joinedAt: user.created_at.toISOString(),
        isFollowing,
        isOwnProfile,
      },
      posts: formattedPosts,
    })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    )
  }
}
