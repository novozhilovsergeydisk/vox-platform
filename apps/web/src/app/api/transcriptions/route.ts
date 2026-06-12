import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { query } from "@transcription/db"
import { transcriptionQueue } from "@/lib/queue"

// 1. GET: Получение истории транскрипций пользователя
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const userId = session.user.id

    // Запрос истории через нативный SQL
    const res = await query(
      "SELECT * FROM transcriptions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    )

    return NextResponse.json(res.rows)
  } catch (error) {
    console.error("Ошибка при получении транскрипций:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// 2. POST: Создание транскрипции по URL (YouTube, Vimeo и др.)
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { title, sourceUrl, language } = body

    if (!title || !sourceUrl) {
      return NextResponse.json({ error: "Название и URL обязательны" }, { status: 400 })
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

    const transcriptionId = crypto.randomUUID()

    // Создаем запись в БД со статусом PENDING
    const insertRes = await query(
      `INSERT INTO transcriptions (id, user_id, title, source_url, language, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [transcriptionId, userId, title, sourceUrl, language || "ru", "PENDING"]
    )

    const newTranscription = insertRes.rows[0]

    // Добавляем задачу в очередь BullMQ для фоновой обработки
    await transcriptionQueue.add("transcribe-job", {
      transcriptionId,
      userId,
      sourceUrl,
      language: language || "ru",
      type: "url",
    })

    return NextResponse.json(newTranscription, { status: 201 })
  } catch (error) {
    console.error("Ошибка при создании транскрипции по URL:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
