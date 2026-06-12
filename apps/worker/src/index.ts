import * as dotenv from "dotenv"
import { join } from "path"

// Загружаем env переменные из корня проекта
dotenv.config({ path: join(__dirname, "../../../.env") })

import { Worker, Job } from "bullmq"
import IORedis from "ioredis"
import { query } from "@transcription/db"
import { spawn } from "child_process"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null })

console.log("🚀 Фоновый воркер VOX запущен и слушает Redis...")

// Хелперы для форматирования времени субтитров в JS
function formatSrtTime(seconds: number): string {
  const date = new Date(seconds * 1000)
  const hh = Math.floor(seconds / 3600).toString().padStart(2, "0")
  const mm = date.getUTCMinutes().toString().padStart(2, "0")
  const ss = date.getUTCSeconds().toString().padStart(2, "0")
  const ms = date.getUTCMilliseconds().toString().padStart(3, "0")
  return `${hh}:${mm}:${ss},${ms}`
}

function formatVttTime(seconds: number): string {
  const date = new Date(seconds * 1000)
  const hh = Math.floor(seconds / 3600).toString().padStart(2, "0")
  const mm = date.getUTCMinutes().toString().padStart(2, "0")
  const ss = date.getUTCSeconds().toString().padStart(2, "0")
  const ms = date.getUTCMilliseconds().toString().padStart(3, "0")
  return `${hh}:${mm}:${ss}.${ms}`
}

function generateSrt(segments: any[]): string {
  return segments
    .map((s, i) => `${i + 1}\n${formatSrtTime(s.start)} --> ${formatSrtTime(s.end)}\n${s.text}`)
    .join("\n\n")
}

function generateVtt(segments: any[]): string {
  return "WEBVTT\n\n" + segments
    .map((s, i) => `${i + 1}\n${formatVttTime(s.start)} --> ${formatVttTime(s.end)}\n${s.text}`)
    .join("\n\n")
}

const worker = new Worker(
  "transcription-queue",
  async (job: Job) => {
    const { transcriptionId, userId, filePath, sourceUrl, language, type } = job.data

    console.log(`[Job ${job.id}] Начало обработки транскрипции ${transcriptionId}`)

    // 1. Обновляем статус в БД на PROCESSING
    await query(
      "UPDATE transcriptions SET status = 'PROCESSING', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [transcriptionId]
    )

    // Определяем файл для обработки (скачиваем, если по ссылке URL)
    let targetFilePath = filePath
    let fileUrl: string | null = null

    if (type === "url") {
      console.log(`[Job ${job.id}] Загрузка аудио по URL через yt-dlp: ${sourceUrl}...`)
      // Путь к папке uploads внутри apps/web/public
      const uploadDir = join(__dirname, "../../../apps/web/public/uploads")
      const uniqueFileName = `${transcriptionId}.mp3`
      const outputFilePath = join(uploadDir, uniqueFileName)
      
      fileUrl = `/uploads/${uniqueFileName}`

      try {
        await new Promise<void>((resolveDownload, rejectDownload) => {
          const ytDlpProcess = spawn("yt-dlp", [
            "--no-playlist",
            "-x",
            "--audio-format",
            "mp3",
            "-o",
            outputFilePath,
            sourceUrl
          ])

          let stderr = ""
          ytDlpProcess.stderr.on("data", (chunk: any) => {
            stderr += chunk.toString()
          })

          ytDlpProcess.on("close", (code: number | null) => {
            if (code === 0) {
              console.log(`[Job ${job.id}] Аудио с YouTube успешно скачано в ${outputFilePath}`)
              resolveDownload()
            } else {
              rejectDownload(new Error(`yt-dlp завершился с кодом ${code}: ${stderr.slice(-500)}`))
            }
          })
        })

        // Записываем локальный путь к скачанному файлу в базу данных, чтобы плеер заиграл
        await query(
          "UPDATE transcriptions SET file_url = $1, file_name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
          [fileUrl, uniqueFileName, transcriptionId]
        )
        
        targetFilePath = outputFilePath
      } catch (downloadError: any) {
        console.error(`[Job ${job.id}] Ошибка скачивания через yt-dlp:`, downloadError)
        
        await query(
          "UPDATE transcriptions SET status = 'FAILED', error_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [`Ошибка скачивания медиафайла по URL: ${downloadError.message}`, transcriptionId]
        )
        return // Прерываем выполнение
      }
    }

    // 2. Запуск Python скрипта распознавания
    return new Promise<void>((resolve, reject) => {
      const pythonScriptPath = join(__dirname, "../../../services/transcription/transcribe.py")
      
      console.log(`[Job ${job.id}] Запуск скрипта: python3 ${pythonScriptPath} --file "${targetFilePath}" --lang "${language}"`)
      
      const pythonProcess = spawn("python3", [
        pythonScriptPath,
        "--file", targetFilePath,
        "--lang", language,
        "--model", process.env.WHISPER_MODEL || "base"
      ])

      let stdoutData = ""
      let stderrData = ""

      pythonProcess.stdout.on("data", (data: any) => {
        stdoutData += data.toString()
      })

      pythonProcess.stderr.on("data", (data: any) => {
        stderrData += data.toString()
      })

      pythonProcess.on("close", async (code: number | null) => {
        if (code !== 0) {
          console.error(`[Job ${job.id}] Скрипт упал с кодом ${code}. Stderr: ${stderrData}`)
          
          await query(
            "UPDATE transcriptions SET status = 'FAILED', error_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [`Процесс распознавания завершился с ошибкой: ${stderrData.slice(0, 500)}`, transcriptionId]
          )
          reject(new Error(`Python process exited with code ${code}`))
          return
        }

        try {
          // Вытаскиваем результат из stdout
          const markerStart = "--- TRANSCRIPTION_RESULT_START ---"
          const markerEnd = "--- TRANSCRIPTION_RESULT_END ---"
          
          const startIdx = stdoutData.indexOf(markerStart)
          const endIdx = stdoutData.indexOf(markerEnd)

          if (startIdx === -1 || endIdx === -1) {
            throw new Error("Не удалось найти маркеры результатов в выводе Python-скрипта")
          }

          const jsonString = stdoutData.slice(startIdx + markerStart.length, endIdx).trim()
          const result = JSON.parse(jsonString)

          const { text, segments, duration, language: detectedLanguage } = result

          // Генерируем субтитры
          const srtContent = generateSrt(segments)
          const vttContent = generateVtt(segments)

          // 3. Записываем результат в базу данных
          await query(
            `UPDATE transcriptions 
             SET status = 'COMPLETED', text = $1, srt = $2, vtt = $3, json_segments = $4, duration = $5, language = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7`,
            [text, srtContent, vttContent, JSON.stringify(segments), duration, detectedLanguage, transcriptionId]
          )

          // 4. Списываем секунды с баланса пользователя
          const durationSeconds = Math.ceil(duration)
          await query(
            `UPDATE users 
             SET transcription_balance = GREATEST(0, transcription_balance - $1), updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [durationSeconds, userId]
          )

          console.log(`[Job ${job.id}] Транскрипция ${transcriptionId} успешно завершена! Списано секунд: ${durationSeconds}`)
          resolve()
        } catch (err: any) {
          console.error(`[Job ${job.id}] Ошибка при парсинге результатов:`, err)
          
          await query(
            "UPDATE transcriptions SET status = 'FAILED', error_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [`Ошибка сохранения результатов: ${err.message}`, transcriptionId]
          )
          reject(err)
        }
      })
    })
  },
  { connection: connection as any }
)

worker.on("failed", (job, err) => {
  console.error(`[Job ${job?.id}] Задача провалена:`, err)
})
