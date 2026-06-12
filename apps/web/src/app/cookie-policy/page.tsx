import Link from "next/link"
import { Cookie, ArrowLeft } from "lucide-react"

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Вернуться на главную
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <Cookie className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Политика использования файлов cookie</h1>
        </div>
        
        <p className="text-sm text-muted-foreground mb-8">Последнее обновление: 12 июня 2026 г.</p>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Настоящий документ объясняет, как сервис VOX (далее — Сервис) использует файлы cookie и аналогичные технологии для распознавания вас при посещении нашего веб-сайта.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Что такое файлы cookie?</h2>
            <p>
              Файлы cookie (куки) — это небольшие текстовые файлы, которые сохраняются в вашем браузере или на жестком диске вашего устройства при посещении веб-сайта. Они позволяют сайту запоминать ваши действия и предпочтения (например, логин, язык, размер шрифта и другие настройки отображения) в течение определенного времени, чтобы вам не приходилось вводить их повторно при повторном посещении сайта.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Какие файлы cookie мы используем?</h2>
            <p>Мы используем следующие типы файлов cookie:</p>
            <div className="space-y-3 mt-3">
              <div>
                <strong className="text-foreground">Обязательные (технические) файлы cookie:</strong>
                <p>Необходимы для обеспечения правильной работы сайта, авторизации пользователей, обеспечения безопасности сессий NextAuth и сохранения выбранной вами цветовой темы (светлая/темная).</p>
              </div>
              <div>
                <strong className="text-foreground">Аналитические файлы cookie:</strong>
                <p>Помогают нам собирать обезличенную статистику о посещении сайта пользователями с помощью систем Яндекс.Метрика и Google Analytics, чтобы мы могли улучшать функционал и скорость работы Сервиса.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Как управлять файлами cookie?</h2>
            <p>
              Вы можете настроить свой браузер так, чтобы он блокировал или предупреждал вас об этих файлах cookie, но в таком случае некоторые функции Сервиса (например, автоматический вход в аккаунт) могут перестать работать.
            </p>
            <p className="mt-2">
              Большинство современных браузеров позволяют отключать cookies через свои настройки конфиденциальности. Подробные инструкции вы можете найти в руководстве пользователя вашего браузера (Chrome, Firefox, Safari, Edge).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Изменения в политике</h2>
            <p>
              Мы можем время от времени обновлять настоящую Политику в связи с изменениями в законодательстве или технологиях. Пожалуйста, регулярно проверяйте эту страницу, чтобы оставаться в курсе актуальной информации.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
