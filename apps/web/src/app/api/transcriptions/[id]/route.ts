import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { query } from "@transcription/db"
import { unlink } from "fs/promises"
import { join } from "path"

// Вспомогательная функция для проверки владельца транскрипции
async function getOwnedTranscription(id: string, userId: string) {
  const res = await query(
    "SELECT * FROM transcriptions WHERE id = $1 AND user_id = $2",
    [id, userId]
  )
  return res.rows.length > 0 ? res.rows[0] : null
}

// 1. GET: Получение подробной информации о транскрипции
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { id } = await params
    const transcription = await getOwnedTranscription(id, session.user.id)

    if (!transcription) {
      return NextResponse.json({ error: "Транскрипция не найдена" }, { status: 404 })
    }

    return NextResponse.json(transcription)
  } catch (error) {
    console.error("Ошибка при получении деталей транскрипции:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// 2. PATCH: Обновление текста транскрипции (редактирование)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { id } = await params
    const transcription = await getOwnedTranscription(id, session.user.id)

    if (!transcription) {
      return NextResponse.json({ error: "Транскрипция не найдена" }, { status: 404 })
    }

    const body = await request.json()
    const { title, text, srt, vtt, jsonSegments } = body

    // Динамическое построение SQL-запроса на обновление
    const updates: string[] = []
    const values: any[] = []
    let valIdx = 1

    if (title !== undefined) {
      updates.push(`title = $${valIdx++}`)
      values.push(title)
    }
    if (text !== undefined) {
      updates.push(`text = $${valIdx++}`)
      values.push(text)
    }
    if (srt !== undefined) {
      updates.push(`srt = $${valIdx++}`)
      values.push(srt)
    }
    if (vtt !== undefined) {
      updates.push(`vtt = $${valIdx++}`)
      values.push(vtt)
    }
    if (jsonSegments !== undefined) {
      updates.push(`json_segments = $${valIdx++}`)
      values.push(JSON.stringify(jsonSegments))
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 })
    }

    values.push(id)
    values.push(session.user.id)

    const updateQuery = `
      UPDATE transcriptions 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${valIdx++} AND user_id = $${valIdx++} 
      RETURNING *
    `

    const res = await query(updateQuery, values)
    return NextResponse.json(res.rows[0])
  } catch (error) {
    console.error("Ошибка при обновлении транскрипции:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// 3. DELETE: Удаление транскрипции и связанных медиа-файлов
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { id } = await params
    const transcription = await getOwnedTranscription(id, session.user.id)

    if (!transcription) {
      return NextResponse.json({ error: "Транскрипция не найдена" }, { status: 404 })
    }

    // Удаляем файл с диска, если он был загружен локально
    if (transcription.file_url) {
      const fileName = transcription.file_url.split("/").pop()
      if (fileName) {
        const filePath = join(process.cwd(), "public", "uploads", fileName)
        try {
          await unlink(filePath)
        } catch (err) {
          // Игнорируем ошибку, если файл уже удален с диска
          console.warn("Файл для удаления не найден на диске:", filePath)
        }
      }
    }

    // Удаляем запись из БД
    await query("DELETE FROM transcriptions WHERE id = $1 AND user_id = $2", [
      id,
      session.user.id,
    ])

    return NextResponse.json({ message: "Транскрипция успешно удалена" })
  } catch (error) {
    console.error("Ошибка при удалении транскрипции:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
