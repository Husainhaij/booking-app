import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

// Extend next-auth types so session.user.id and session.user.slug are typed
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      slug: string
    }
  }
  interface User {
    id: string
    slug: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    slug: string
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          select: { id: true, name: true, email: true, password: true, slug: true },
        })

        if (!user) {
          // Use same message to avoid user enumeration
          throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
        }

        const passwordValid = await compare(credentials.password, user.password)
        if (!passwordValid) {
          throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
        }

        return { id: user.id, name: user.name, email: user.email, slug: user.slug }
      },
    }),
  ],

  callbacks: {
    // Attach id and slug to the JWT token on login
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.slug = user.slug
      }
      return token
    },

    // Expose id and slug on session.user so route handlers can use them
    async session({ session, token }) {
      session.user.id   = token.id
      session.user.slug = token.slug
      return session
    },
  },
}
