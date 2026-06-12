"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useToast } from "@/components/ui/toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mic, 
  Upload, 
  Link as LinkIcon, 
  History, 
  Clock, 
  LogOut, 
  Play, 
  Trash2, 
  Download, 
  ExternalLink,
  Loader2,
  FileText,
  AlertTriangle
} from "lucide-react"

interface DashboardClientProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role: string
    plan: string
    transcriptionBalance: number
  }
}

interface Transcription {
  id: string
  title: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  file_url?: string
  source_url?: string
  duration: number
  language?: string
  created_at: string
  error_message?: string
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const toast = useToast()
  
  // States
  const [activeTab, setActiveTab] = useState<"file" | "url">("file")
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [balance, setBalance] = useState(user.transcriptionBalance)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadLanguage, setUploadLanguage] = useState("ru")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // URL upload states
  const [urlTitle, setUrlTitle] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [urlLanguage, setUrlLanguage] = useState("ru")
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false)

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch history
  const fetchHistory = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingHistory(true)
    try {
      const res = await fetch("/api/transcriptions")
      if (res.ok) {
        const data = await res.ok ? await res.json() : []
        setTranscriptions(data)
      }
    } catch (err) {
      console.error(err)
      if (!silent) toast.error("Не удалось загрузить историю транскрипций")
    } finally {
      if (!silent) setIsLoadingHistory(false)
    }
  }, [toast])

  // Initial fetch
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Polling for processing tasks (every 5 seconds)
  useEffect(() => {
    const hasPendingTasks = transcriptions.some(
      (t) => t.status === "PENDING" || t.status === "PROCESSING"
    )

    if (!hasPendingTasks) return

    const interval = setInterval(() => {
      fetchHistory(true)
      // Также обновляем баланс, если задачи завершились
      fetch("/api/auth/session")
        .then((res) => res.json())
        .then((data) => {
          if (data?.user?.transcriptionBalance !== undefined) {
            setBalance(data.user.transcriptionBalance)
          }
        })
    }, 5000)

    return () => clearInterval(interval)
  }, [transcriptions, fetchHistory])

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  // Handle File Upload Submit
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || isUploading) return

    setIsUploading(true)
    setUploadProgress(10)

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("language", uploadLanguage)

    try {
      const res = await fetch("/api/transcriptions/upload", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(70)
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Не удалось загрузить файл")
        setIsUploading(false)
        setUploadProgress(0)
        return
      }

      setUploadProgress(100)
      toast.success("Файл успешно загружен и добавлен в очередь!")
      setSelectedFile(null)
      fetchHistory(true)
    } catch (err) {
      console.error(err)
      toast.error("Ошибка сети при загрузке файла")
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  // Handle URL Submit
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoUrl || !urlTitle || isSubmittingUrl) return

    setIsSubmittingUrl(true)

    try {
      const res = await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: urlTitle,
          sourceUrl: videoUrl,
          language: urlLanguage,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Не удалось отправить ссылку")
        setIsSubmittingUrl(false)
        return
      }

      toast.success("Ссылка успешно отправлена на обработку!")
      setVideoUrl("")
      setUrlTitle("")
      fetchHistory(true)
    } catch (err) {
      console.error(err)
      toast.error("Ошибка сети при отправке ссылки")
    } finally {
      setIsSubmittingUrl(false)
    }
  }

  // Handle Delete Confirmation
  const handleDelete = async () => {
    if (!deleteTargetId || isDeleting) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/transcriptions/${deleteTargetId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Транскрипция успешно удалена")
        setTranscriptions(transcriptions.filter((t) => t.id !== deleteTargetId))
      } else {
        const data = await res.json()
        toast.error(data.error || "Не удалось удалить запись")
      }
    } catch (err) {
      console.error(err)
      toast.error("Ошибка сети при удалении записи")
    } finally {
      setIsDeleting(false)
      setDeleteTargetId(null)
    }
  }

  // Format Duration (sec -> mm:ss)
  const formatDuration = (sec: number) => {
    if (!sec || isNaN(sec)) return "00:00"
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Format Date (ISO -> DD.MM.YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Helper for downloading TXT
  const downloadTxt = (transcription: Transcription) => {
    // В будущем мы настроим нормальный экспорт, а пока выгрузим заглушку или имеющийся текст
    toast.info("Подготовка файла для скачивания...")
    // Если текст готов, скачиваем его
    if (transcription.status === "COMPLETED") {
      // Здесь мы должны сделать запрос к API деталей или загрузить его
      fetch(`/api/transcriptions/${transcription.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.text) {
            toast.error("Текст транскрипции пустой")
            return
          }
          const blob = new Blob([data.text], { type: "text/plain;charset=utf-8" })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${transcription.title}.txt`
          link.click()
          URL.revokeObjectURL(url)
          toast.success("Файл успешно скачан!")
        })
        .catch(() => toast.error("Не удалось скачать файл"))
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/50 bg-card/45 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-md shadow-primary/20">
            <Mic className="h-5 w-5 text-white" />
          </Link>
          <span className="font-bold text-xl tracking-tight">VOX / Кабинет</span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden sm:flex flex-col text-right text-xs">
            <span className="font-semibold">{user.name || user.email}</span>
            <span className="text-muted-foreground">{user.email}</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            title="Выйти из аккаунта"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column (User Profile & Balance info) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card: Plan & Balance */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Тарифный план</span>
              <span className="text-xs font-bold py-1 px-2.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                {user.plan}
              </span>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Доступное время
              </span>
              <div className="text-2xl font-bold tracking-tight">
                {Math.floor(balance / 60)} мин {balance % 60} сек
              </div>
            </div>

            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              {/* Показываем процент от 30 минут (1800 секунд) для Free */}
              <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (balance / 1800) * 100)}%` }} 
              />
            </div>

            <Link 
              href="/#pricing" 
              className="block w-full py-2.5 text-center text-sm font-semibold bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors"
            >
              Купить еще минут
            </Link>
          </div>

          {/* Quick FAQ info panel */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/50 text-xs text-muted-foreground space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
              <AlertTriangle className="h-4 w-4 text-primary" /> Полезные советы
            </h4>
            <p>1. Загружайте файлы хорошего качества без сильного ветра и шумов — точность распознавания ИИ будет выше.</p>
            <p>2. Автоматическое определение языка включено по умолчанию, но ручной выбор языка ускоряет обработку.</p>
          </div>
        </div>

        {/* Right Column (New Transcription Form & History) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Section: Create new Transcription */}
          <section className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Новая транскрибация</h2>
            
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("file")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 px-4 ${activeTab === "file" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <Upload className="h-4 w-4" /> Загрузить файл
              </button>
              <button
                onClick={() => setActiveTab("url")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 px-4 ${activeTab === "url" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <LinkIcon className="h-4 w-4" /> По ссылке URL
              </button>
            </div>

            {/* Tab: File Upload */}
            {activeTab === "file" && (
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border hover:border-primary/50 bg-background/40 hover:bg-primary/5 transition-all rounded-xl p-8 text-center cursor-pointer flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <input
                    type="file"
                    id="file-input"
                    accept="audio/*,video/*"
                    disabled={isUploading}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFile(e.target.files[0])
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="h-10 w-10 text-primary mb-3" />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground max-w-xs truncate mx-auto">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} МБ
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-foreground">
                        Перетащите аудио/видео файл сюда или нажмите для выбора
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, M4A, MP4, MOV, MKV (до 50 МБ)
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="file-language" className="text-xs font-semibold">Язык распознавания</label>
                    <select
                      id="file-language"
                      disabled={isUploading}
                      value={uploadLanguage}
                      onChange={(e) => setUploadLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none"
                    >
                      <option value="ru">Русский</option>
                      <option value="en">Английский</option>
                      <option value="auto">Автоопределение</option>
                    </select>
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Загрузка файла на сервер...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md shadow-primary/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Загрузка...
                    </>
                  ) : (
                    "Начать транскрибацию"
                  )}
                </button>
              </form>
            )}

            {/* Tab: URL Submission */}
            {activeTab === "url" && (
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="url-title" className="text-xs font-semibold">Название проекта</label>
                    <input
                      id="url-title"
                      type="text"
                      placeholder="Например: Мое интервью с инвестором"
                      required
                      disabled={isSubmittingUrl}
                      value={urlTitle}
                      onChange={(e) => setUrlTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="url-input" className="text-xs font-semibold">Ссылка на видео (YouTube, Vimeo и др.)</label>
                    <input
                      id="url-input"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                      disabled={isSubmittingUrl}
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="url-language" className="text-xs font-semibold">Язык видео</label>
                    <select
                      id="url-language"
                      disabled={isSubmittingUrl}
                      value={urlLanguage}
                      onChange={(e) => setUrlLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm focus:outline-none"
                    >
                      <option value="ru">Русский</option>
                      <option value="en">Английский</option>
                      <option value="auto">Автоопределение</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!videoUrl || !urlTitle || isSubmittingUrl}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md shadow-primary/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingUrl ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Добавление в очередь...
                    </>
                  ) : (
                    "Запустить обработку"
                  )}
                </button>
              </form>
            )}
          </section>

          {/* Section: Transcription History */}
          <section className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> История транскрипций
              </h2>
              <button 
                onClick={() => fetchHistory()}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Обновить список
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm">Загрузка ваших проектов...</span>
              </div>
            ) : transcriptions.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">История пуста</p>
                <p className="text-xs">Вы еще не запускали транскрибацию. Загрузите свой первый файл выше!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Проект</th>
                      <th className="py-3 px-4">Язык</th>
                      <th className="py-3 px-4">Статус</th>
                      <th className="py-3 px-4">Дата</th>
                      <th className="py-3 px-4">Длительность</th>
                      <th className="py-3 px-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {transcriptions.map((t) => (
                      <tr key={t.id} className="hover:bg-accent/20 transition-colors">
                        <td className="py-3.5 px-4 font-semibold max-w-[200px] truncate">
                          {t.title}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium uppercase text-muted-foreground">
                          {t.language}
                        </td>
                        <td className="py-3.5 px-4">
                          {t.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium py-0.5 px-2.5 rounded-full bg-amber-500/10 text-amber-500">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> В очереди
                            </span>
                          )}
                          {t.status === "PROCESSING" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium py-0.5 px-2.5 rounded-full bg-blue-500/10 text-blue-500">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> В обработке
                            </span>
                          )}
                          {t.status === "COMPLETED" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium py-0.5 px-2.5 rounded-full bg-emerald-500/10 text-emerald-500">
                              Готово
                            </span>
                          )}
                          {t.status === "FAILED" && (
                            <span 
                              className="inline-flex items-center gap-1.5 text-xs font-medium py-0.5 px-2.5 rounded-full bg-rose-500/10 text-rose-500 cursor-help"
                              title={t.error_message || "Ошибка распознавания"}
                            >
                              Ошибка
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {formatDate(t.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono">
                          {t.status === "COMPLETED" ? formatDuration(t.duration) : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {t.status === "COMPLETED" ? (
                            <>
                              <Link 
                                href={`/dashboard/editor/${t.id}`}
                                className="inline-flex p-1.5 rounded-lg border border-border bg-card text-primary hover:bg-accent transition-colors"
                                title="Редактор транскрипции"
                              >
                                <Play className="h-4 w-4" />
                              </Link>
                              <button 
                                onClick={() => downloadTxt(t)}
                                className="inline-flex p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                title="Скачать текст"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </>
                          ) : t.status === "FAILED" && t.error_message ? (
                            <button
                              onClick={() => toast.error(`Детали ошибки: ${t.error_message}`)}
                              className="inline-flex p-1.5 rounded-lg border border-border bg-card text-rose-500 hover:bg-accent transition-colors"
                              title="Показать ошибку"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button 
                            onClick={() => setDeleteTargetId(t.id)}
                            className="inline-flex p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-rose-500 hover:bg-accent transition-colors"
                            title="Удалить проект"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTargetId(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            {/* Modal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-foreground">Удалить проект?</h3>
              <p className="text-sm text-muted-foreground">
                Это действие необратимо. Запись в базе данных и загруженный медиафайл будут полностью удалены без возможности восстановления.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-border bg-secondary hover:bg-accent text-foreground text-sm font-semibold rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Удалить"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
