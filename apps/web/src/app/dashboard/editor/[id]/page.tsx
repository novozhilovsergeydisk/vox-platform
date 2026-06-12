import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { query } from "@transcription/db"
import EditorClient from "./editor-client"

interface EditorPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

  // Запрашиваем транскрипцию напрямую из базы данных
  const res = await query(
    "SELECT * FROM transcriptions WHERE id = $1 AND user_id = $2",
    [id, session.user.id]
  )

  if (res.rows.length === 0) {
    notFound()
  }

  const transcription = res.rows[0]

  return <EditorClient initialTranscription={transcription} />
}
