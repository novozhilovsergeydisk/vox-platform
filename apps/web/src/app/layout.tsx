import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/ui/toast"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
})

export const metadata: Metadata = {
  title: "VOX - VIP Платформа транскрибации аудио и видео на базе AI",
  description: "Быстрая и точная транскрибация аудио и видео в текст, субтитры SRT/VTT и экспорт в DOCX/PDF. Локальная обработка Whisper для полной приватности.",
  keywords: ["транскрибация", "аудио в текст", "видео в текст", "субтитры", "whisper", "распознавание речи"],
  authors: [{ name: "VOX Team" }],
  openGraph: {
    title: "VOX - VIP Платформа транскрибации аудио и видео",
    description: "Переводите аудио и видео в текст за секунды с помощью искусственного интеллекта.",
    url: "https://vox-transcribe.ru",
    siteName: "VOX",
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="h-full">
      <body className={`${inter.variable} font-sans h-full antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
