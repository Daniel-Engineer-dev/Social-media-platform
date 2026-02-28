import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          throw new Error("Email không tồn tại")
        }

        if (!user.password_hash) {
          throw new Error("Tài khoản này sử dụng đăng nhập OAuth")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash)

        if (!isPasswordValid) {
          throw new Error("Mật khẩu không chính xác")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only handle OAuth sign-ins (Google, GitHub)
      if (account?.provider === "credentials") {
        return true
      }

      if (!user.email) {
        return false
      }

      try {
        // Check if the user already exists by email
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (!existingUser) {
          // Generate username from email
          let username = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")

          // Check if username exists, if so add a random suffix
          const existingUsername = await prisma.user.findUnique({
            where: { username },
          })

          if (existingUsername) {
            username = `${username}${Math.floor(Math.random() * 9999)}`
          }

          // Create new user from OAuth profile
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || username,
              username,
              avatar_url: user.image || "/images/default-avatar.jpg",
              password_hash: null, // OAuth user — no password
            },
          })
        }

        // Check if this OAuth account is already linked
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_provider_account_id: {
              provider: account!.provider,
              provider_account_id: account!.providerAccountId,
            },
          },
        })

        if (!existingAccount) {
          // Link OAuth account to the user
          await prisma.account.create({
            data: {
              user_id: existingUser.id,
              provider: account!.provider,
              provider_account_id: account!.providerAccountId,
              access_token: account!.access_token ?? null,
              refresh_token: account!.refresh_token ?? null,
              token_type: account!.token_type ?? null,
              scope: account!.scope ?? null,
              id_token: account!.id_token ?? null,
              expires_at: account!.expires_at
                ? new Date(account!.expires_at * 1000)
                : null,
            },
          })
        }

        // Store the database user id for the JWT callback
        user.id = existingUser.id

        return true
      } catch (error) {
        console.error("OAuth sign-in error:", error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
