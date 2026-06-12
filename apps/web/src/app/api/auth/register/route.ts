import { NextResponse } from "next/server"
import { query } from "@transcription/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Схема валидации регистрации (включая чекбоксы согласия по закону 152-ФЗ)
const registerSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: "Необходимо согласие с политикой конфиденциальности",
  }),
  personalDataAccepted: z.boolean().refine(val => val === true, {
    message: "Необходимо согласие на обработку персональных данных",
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // 1. Проверяем, существует ли пользователь
    const existingUserRes = await query("SELECT id FROM users WHERE email = $1", [email])
    if (existingUserRes.rows.length > 0) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже зарегистрирован" },
        { status: 409 }
      )
    }

    // 2. Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Создаем ID пользователя
    const userId = crypto.randomUUID()

    // 4. Записываем в базу данных (по умолчанию тариф FREE, баланс 1800 секунд)
    await query(
      `INSERT INTO users (id, name, email, password, role, transcription_balance, plan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, name, email, hashedPassword, "USER", 1800, "FREE"]
    )

    return NextResponse.json(
      { message: "Регистрация прошла успешно", userId },
      { status: 201 }
    )
  } catch (error) {
    console.error("Ошибка регистрации:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
