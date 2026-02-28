import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require auth
  const publicRoutes = ["/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isApiAuthRoute = pathname.startsWith("/api/auth")
  const isStaticRoute =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".ico")

  // Allow static files and API auth routes
  if (isStaticRoute || isApiAuthRoute) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect unauthenticated users to auth page
  if (!token && !isPublicRoute) {
    const authUrl = new URL("/auth", request.nextUrl.origin)
    return NextResponse.redirect(authUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
