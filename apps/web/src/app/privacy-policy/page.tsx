import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"

export default function PrivacyPolicy() {
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
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Политика конфиденциальности</h1>
        </div>
        
        <p className="text-sm text-muted-foreground mb-8">Последнее обновление: 12 июня 2026 г.</p>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сервиса VOX (далее — Сервис), получаемых ООО «ВОКС ТЕХНОЛОГИИ» (далее — Оператор). Мы ценим вашу конфиденциальность и стремимся защитить ваши личные данные.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Какие данные мы собираем</h2>
            <p>Мы собираем только те данные, которые необходимы для предоставления услуг Сервиса:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Имя пользователя</li>
              <li>Адрес электронной почты</li>
              <li>Технические данные (IP-адрес, тип браузера, cookies)</li>
              <li>Загружаемые медиафайлы (исключительно для целей транскрибации)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Цели обработки данных</h2>
            <p>Обработка персональных данных осуществляется в целях:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Регистрации и идентификации пользователя в Сервисе</li>
              <li>Предоставления услуг по транскрибации аудио и видеофайлов</li>
              <li>Связи с пользователем (техническая поддержка, уведомления, маркетинг)</li>
              <li>Улучшения качества работы Сервиса и разработки новых функций</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Хранение и безопасность данных</h2>
            <p>
              Все собираемые персональные данные хранятся на защищенных серверах, расположенных на территории Российской Федерации, в соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных». Мы применяем современные шифрования и меры безопасности для предотвращения несанкционированного доступа.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Срок хранения</h2>
            <p>
              Персональные данные хранятся до тех пор, пока у пользователя активна учетная запись, либо в течение срока, необходимого для достижения целей обработки, или установленного законодательством РФ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Права пользователя</h2>
            <p>Вы имеете право:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Запросить доступ к своим персональным данным и получить информацию об их обработке</li>
              <li>Потребовать уточнения или исправления ваших данных</li>
              <li>Отозвать согласие на обработку данных и потребовать удаления аккаунта</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Контакты</h2>
            <p>
              Если у вас возникли вопросы по поводу данной Политики или вы хотите отозвать согласие на обработку персональных данных, свяжитесь с нашей службой поддержки по электронной почте: <span className="text-foreground">support@vox-transcribe.ru</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
