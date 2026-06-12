"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      title={theme === "dark" ? "Включить светлую тему" : "Включить темную тему"}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400 transition-all rotate-0 scale-100" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-slate-700 transition-all rotate-0 scale-100" />
      )}
    </button>
  )
}
