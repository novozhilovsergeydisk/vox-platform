import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { query } from "@transcription/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data

        try {
          // Нативный SQL-запрос для поиска пользователя
          const res = await query("SELECT * FROM users WHERE email = $1", [email])
          
          if (res.rows.length === 0) {
            return null
          }

          const user = res.rows[0]
          
          // Проверяем пароль
          const isPasswordCorrect = await bcrypt.compare(password, user.password)

          if (!isPasswordCorrect) {
            return null
          }

          // Возвращаем объект пользователя для сессии
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: user.plan,
            transcriptionBalance: user.transcription_balance,
          }
        } catch (error) {
          console.error("Ошибка при авторизации:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.plan = (user as any).plan
        token.transcriptionBalance = (user as any).transcriptionBalance
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.plan = token.plan as string
        session.user.transcriptionBalance = token.transcriptionBalance as number
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

// Расширяем типы NextAuth, чтобы TypeScript знал про наши кастомные поля сессии
declare module "next-auth" {
  interface User {
    role?: string
    plan?: string
    transcriptionBalance?: number
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      plan: string
      transcriptionBalance: number
    }
  }
}
