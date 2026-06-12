import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { query } from "@transcription/db"
import { transcriptionQueue } from "@/lib/queue"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

// Разрешенные форматы файлов
const ALLOWED_FORMATS = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/x-m4a", "audio/m4a", "video/mp4", "video/quicktime", "video/x-matroska"]
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB по умолчанию для Free (можно расширить для Pro)

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const userId = session.user.id

    // Получаем formData
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const language = formData.get("language") as string || "ru"

    if (!file) {
      return NextResponse.json({ error: "Файл не предоставлен" }, { status: 400 })
    }

    // Валидация формата
    if (!ALLOWED_FORMATS.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|mp4|mov|mkv)$/i)) {
      return NextResponse.json(
        { error: "Неподдерживаемый формат файла. Допустимы MP3, WAV, M4A, MP4, MOV, MKV." },
        { status: 400 }
      )
    }

    // Валидация размера
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Размер файла превышает лимит 50 МБ для бесплатного тарифа." },
        { status: 400 }
      )
    }

    // Проверяем баланс минут пользователя
    const userRes = await query("SELECT transcription_balance FROM users WHERE id = $1", [userId])
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    const balance = userRes.rows[0].transcription_balance
    if (balance <= 0) {
      return NextResponse.json(
        { error: "Недостаточно минут на балансе. Пожалуйста, обновите тариф." },
        { status: 403 }
      )
    }

    // Подготовка пути для записи файла
    const uploadDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const fileExtension = file.name.split(".").pop()
    const transcriptionId = crypto.randomUUID()
    const uniqueFileName = `${transcriptionId}.${fileExtension}`
    const filePath = join(uploadDir, uniqueFileName)

    // Читаем и записываем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${uniqueFileName}`

    // Создаем запись в БД со статусом PENDING
    const insertRes = await query(
      `INSERT INTO transcriptions (id, user_id, title, file_url, file_name, file_size, file_format, language, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        transcriptionId,
        userId,
        file.name, // Название транскрипции по умолчанию — имя файла
        fileUrl,
        uniqueFileName,
        file.size,
        fileExtension || "mp3",
        language,
        "PENDING",
      ]
    )

    const newTranscription = insertRes.rows[0]

    // Добавляем задачу в очередь BullMQ для фоновой обработки
    await transcriptionQueue.add("transcribe-job", {
      transcriptionId,
      userId,
      filePath, // Полный системный путь для worker-а
      fileUrl,  // Относительный веб-путь
      language,
      type: "file",
    })

    return NextResponse.json(newTranscription, { status: 201 })
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
