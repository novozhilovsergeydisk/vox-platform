"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  RotateCcw,
  Sparkles,
  FileText,
  Loader2,
  Share2
} from "lucide-react"

interface TranscriptionSegment {
  start: number
  end: number
  text: string
}

interface Transcription {
  id: string
  title: string
  status: string
  file_url?: string
  source_url?: string
  duration: number
  language?: string
  text?: string
  srt?: string
  vtt?: string
  json_segments?: any // Сюда faster-whisper сложит сегменты
  created_at: string
}

interface EditorClientProps {
  initialTranscription: Transcription
}

export default function EditorClient({ initialTranscription }: EditorClientProps) {
  const router = useRouter()
  const toast = useToast()
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // States
  const [transcription, setTranscription] = useState<Transcription>(initialTranscription)
  const [segments, setSegments] = useState<TranscriptionSegment[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Инициализация сегментов
  useEffect(() => {
    if (transcription.json_segments) {
      try {
        const parsed = typeof transcription.json_segments === "string" 
          ? JSON.parse(transcription.json_segments) 
          : transcription.json_segments
        
        if (Array.isArray(parsed)) {
          setSegments(parsed)
        } else if (parsed.segments) {
          setSegments(parsed.segments)
        }
      } catch (err) {
        console.error("Не удалось пропарсить сегменты:", err)
      }
    } else if (transcription.text) {
      // Если сегментов нет, но есть общий текст, создаем один большой сегмент
      setSegments([{ start: 0, end: transcription.duration || 60, text: transcription.text }])
    }
  }, [transcription])

  // Track playback time
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // Playback control
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSegmentClick = (start: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = start
      setCurrentTime(start)
      if (!isPlaying) {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  // Update segment text in state
  const handleSegmentTextChange = (index: number, newText: string) => {
    const updated = [...segments]
    updated[index].text = newText
    setSegments(updated)
  }

  // Save changes to DB
  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)

    // Собираем весь текст воедино
    const fullText = segments.map(s => s.text.trim()).join(" ")

    try {
      const res = await fetch(`/api/transcriptions/${transcription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullText,
          jsonSegments: segments,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTranscription(data)
        toast.success("Изменения успешно сохранены")
      } else {
        toast.error("Не удалось сохранить изменения")
      }
    } catch (err) {
      console.error(err)
      toast.error("Ошибка сети при сохранении")
    } finally {
      setIsSaving(false)
    }
  }

  // Helper: Format Time (seconds -> mm:ss)
  const formatTime = (time: number) => {
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Export File Generators
  const exportAsTxt = () => {
    const text = segments.map(s => `[${formatTime(s.start)}] ${s.text}`).join("\n\n")
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    triggerDownload(blob, `${transcription.title}.txt`)
  }

  const exportAsSrt = () => {
    // Генератор субтитров SRT
    const formatSrtTime = (seconds: number) => {
      const date = new Date(seconds * 1000)
      const hh = Math.floor(seconds / 3600).toString().padStart(2, "0")
      const mm = date.getUTCMinutes().toString().padStart(2, "0")
      const ss = date.getUTCSeconds().toString().padStart(2, "0")
      const ms = date.getUTCMilliseconds().toString().padStart(3, "0")
      return `${hh}:${mm}:${ss},${ms}`
    }

    const srtContent = segments.map((s, i) => {
      return `${i + 1}\n${formatSrtTime(s.start)} --> ${formatSrtTime(s.end)}\n${s.text}\n`
    }).join("\n")

    const blob = new Blob([srtContent], { type: "text/srt;charset=utf-8" })
    triggerDownload(blob, `${transcription.title}.srt`)
  }

  const exportAsVtt = () => {
    // WebVTT format
    const formatVttTime = (seconds: number) => {
      const date = new Date(seconds * 1000)
      const hh = Math.floor(seconds / 3600).toString().padStart(2, "0")
      const mm = date.getUTCMinutes().toString().padStart(2, "0")
      const ss = date.getUTCSeconds().toString().padStart(2, "0")
      const ms = date.getUTCMilliseconds().toString().padStart(3, "0")
      return `${hh}:${mm}:${ss}.${ms}`
    }

    const vttContent = "WEBVTT\n\n" + segments.map((s, i) => {
      return `${i + 1}\n${formatVttTime(s.start)} --> ${formatVttTime(s.end)}\n${s.text}\n`
    }).join("\n")

    const blob = new Blob([vttContent], { type: "text/vtt;charset=utf-8" })
    triggerDownload(blob, `${transcription.title}.vtt`)
  }

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
    toast.success(`Файл ${fileName} успешно экспортирован`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/50 bg-card/45 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            title="Назад в кабинет"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-base max-w-[200px] sm:max-w-md truncate">{transcription.title}</span>
            <span className="text-xs text-muted-foreground">Редактирование расшифровки</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="py-2 px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Сохранить</span>
          </button>

          {/* Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="py-2 px-3 sm:px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              <span>Экспорт</span>
            </button>
            
            {showExportMenu && (
              <>
                {/* Backdrop overlay to close */}
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={exportAsTxt}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" /> Текст с таймкодами (.txt)
                  </button>
                  <button
                    onClick={exportAsSrt}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-muted-foreground" /> Субтитры SRT (.srt)
                  </button>
                  <button
                    onClick={exportAsVtt}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4 text-muted-foreground" /> Субтитры WebVTT (.vtt)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden h-[calc(100vh-80px)]">
        
        {/* Left Column: Player & Media control */}
        <div className="lg:col-span-1 space-y-6 flex flex-col justify-start">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
            <h3 className="font-bold text-lg">Аудиопроигрыватель</h3>
            
            {/* Native HTML5 Audio */}
            {transcription.file_url ? (
              <audio 
                ref={audioRef}
                src={transcription.file_url}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full hidden"
              />
            ) : (
              <div className="p-4 bg-muted/30 rounded-xl text-xs text-muted-foreground text-center">
                Медиафайл загружен удаленно ({transcription.source_url})
              </div>
            )}

            {/* Custom Premium Audio Player UI */}
            <div className="bg-secondary/40 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(transcription.duration || 0)}</span>
              </div>

              {/* Progress Slider */}
              <div className="relative w-full h-1.5 bg-secondary rounded-full cursor-pointer"
                onClick={(e) => {
                  if (audioRef.current) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const percentage = clickX / rect.width
                    audioRef.current.currentTime = percentage * (transcription.duration || 0)
                  }
                }}
              >
                <div 
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${((currentTime / (transcription.duration || 1)) * 100).toFixed(2)}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={() => {
                    if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 5)
                  }}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  title="Назад на 5 секунд"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-3.5 bg-primary text-primary-foreground hover:scale-105 transition-all rounded-full shadow-lg"
                  title={isPlaying ? "Пауза" : "Воспроизвести"}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (audioRef.current) audioRef.current.currentTime = Math.min(transcription.duration || 0, currentTime + 5)
                  }}
                  className="p-2 hover:bg-secondary rounded-full transition-colors transform rotate-180"
                  title="Вперед на 5 секунд"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground">💡 Синхронизация текста и звука:</p>
              <p>Нажмите на любое предложение справа, чтобы перекрутить плеер на момент начала фразы. Текст автоматически подсвечивается синим цветом при прослушивании.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Segmented text editor */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden border border-border bg-card rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-lg">Расшифрованный текст</h3>
            <span className="text-xs text-muted-foreground uppercase font-mono">
              Язык: {transcription.language || "ru"}
            </span>
          </div>

          {/* Interactive list of segments */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[calc(100vh-250px)]">
            {segments.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground text-sm">
                Текст транскрипции отсутствует или обрабатывается...
              </div>
            ) : (
              segments.map((segment, index) => {
                const isActive = currentTime >= segment.start && currentTime <= segment.end
                
                return (
                  <div 
                    key={index}
                    className={`p-3.5 rounded-xl border transition-all duration-200 flex gap-4 items-start ${isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-background/30 hover:border-border"}`}
                  >
                    {/* Timestamp badge */}
                    <button 
                      onClick={() => handleSegmentClick(segment.start)}
                      className={`text-xs font-mono font-bold px-2 py-1 rounded transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary hover:text-white"}`}
                      title={`Перейти к ${formatTime(segment.start)}`}
                    >
                      {formatTime(segment.start)}
                    </button>

                    {/* Text input area */}
                    <textarea
                      value={segment.text}
                      rows={2}
                      onChange={(e) => handleSegmentTextChange(index, e.target.value)}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm leading-relaxed resize-none p-0 focus:ring-0 text-foreground"
                      placeholder="Введите текст сегмента..."
                    />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
