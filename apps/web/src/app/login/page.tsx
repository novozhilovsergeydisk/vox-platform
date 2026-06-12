"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useToast } from "@/components/ui/toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mic, ArrowRight, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const toast = useToast()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return // Защита от двойного клика

    if (!email.trim() || !password.trim()) {
      toast.error("Пожалуйста, введите email и пароль")
      return
    }

    setIsLoading(true)

    try {
      // Вызываем NextAuth signIn
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast.error("Неверный email или пароль")
        setIsLoading(false)
        return
      }

      toast.success("Вход выполнен! Перенаправляем...")
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Произошла ошибка входа, попробуйте еще раз")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-md shadow-primary/20">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            VOX
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-xl shadow-xl space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Войти в кабинет</h1>
            <p className="text-sm text-muted-foreground">
              Введите ваши данные для доступа к транскрибациям
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold">Электронная почта</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold">Пароль</label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Забыли пароль?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Войти
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Еще нет аккаунта?{" "}
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
