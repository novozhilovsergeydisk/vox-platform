"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { Mic, ArrowRight, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const toast = useToast()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [personalDataAccepted, setPersonalDataAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return // Защита от двойного клика

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Пожалуйста, заполните все обязательные поля")
      return
    }

    if (password.length < 6) {
      toast.error("Пароль должен состоять минимум из 6 символов")
      return
    }

    if (!privacyAccepted || !personalDataAccepted) {
      toast.error("Необходимо дать согласие с юридическими документами")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          privacyAccepted,
          personalDataAccepted,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Не удалось завершить регистрацию")
        setIsLoading(false)
        return
      }

      toast.success("Регистрация успешна! Перенаправляем на вход...")
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (err) {
      console.error(err)
      toast.error("Произошла сетевая ошибка, попробуйте еще раз")
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
            <h1 className="text-2xl font-bold tracking-tight">Создать аккаунт</h1>
            <p className="text-sm text-muted-foreground">
              Начните транскрибировать аудио и видео бесплатно уже сегодня
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold">Имя</label>
              <input
                id="name"
                type="text"
                placeholder="Иван Иванов"
                required
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

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
              <label htmlFor="password" className="text-sm font-semibold">Пароль</label>
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

            {/* Checkboxes 152-ФЗ РФ */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5">
                <input
                  id="privacy"
                  type="checkbox"
                  required
                  disabled={isLoading}
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="h-4.5 w-4.5 mt-0.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
                />
                <label htmlFor="privacy" className="text-xs text-muted-foreground leading-normal cursor-pointer select-none">
                  Я согласен с{" "}
                  <Link href="/privacy-policy" target="_blank" className="text-primary hover:underline font-medium">
                    Политикой конфиденциальности
                  </Link>
                </label>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  id="personal-data"
                  type="checkbox"
                  required
                  disabled={isLoading}
                  checked={personalDataAccepted}
                  onChange={(e) => setPersonalDataAccepted(e.target.checked)}
                  className="h-4.5 w-4.5 mt-0.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
                />
                <label htmlFor="personal-data" className="text-xs text-muted-foreground leading-normal cursor-pointer select-none">
                  Я даю согласие на{" "}
                  <Link href="/personal-data-consent" target="_blank" className="text-primary hover:underline font-medium">
                    обработку персональных данных
                  </Link>
                </label>
              </div>
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
                  Зарегистрироваться
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Войти
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
