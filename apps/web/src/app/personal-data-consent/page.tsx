import Link from "next/link"
import { FileText, ArrowLeft } from "lucide-react"

export default function PersonalDataConsent() {
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
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Согласие на обработку персональных данных</h1>
        </div>
        
        <p className="text-sm text-muted-foreground mb-8">Действует с момента выражения согласия на сайте.</p>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Регистрируясь на сайте <Link href="/" className="text-primary hover:underline">vox-transcribe.ru</Link> и/или используя форму регистрации или обратной связи Сервиса VOX, Пользователь (далее — Субъект), в соответствии со статьей 9 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных», свободно, своей волей и в своем интересе дает согласие ООО «ВОКС ТЕХНОЛОГИИ» (ИНН 7700000000, КПП 770000000, адрес: г. Москва, 127006, ул. Малая Дмитровка, д. 20, далее — Оператор) на автоматизированную и неавтоматизированную обработку своих персональных данных на следующих условиях.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Перечень персональных данных</h2>
            <p>Настоящее согласие предоставляется на обработку следующих персональных данных:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Имя и фамилия</li>
              <li>Адрес электронной почты (e-mail)</li>
              <li>IP-адрес, данные файлов cookie</li>
              <li>Сведения о действиях Субъекта на сайте (дата, время и источник заходов)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Цели обработки</h2>
            <p>Персональные данные Субъекта обрабатываются в целях:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Создания и администрирования личного кабинета Пользователя</li>
              <li>Предоставления услуг по автоматическому распознаванию речи и транскрибации файлов</li>
              <li>Направления информационных, рекламных и транзакционных писем на электронную почту</li>
              <li>Обеспечения работоспособности, безопасности и оптимизации Сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Перечень действий с персональными данными</h2>
            <p>
              Обработка включает в себя сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, блокирование, удаление, уничтожение персональных данных.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Передача третьим лицам</h2>
            <p>
              Оператор не передает персональные данные Субъекта третьим лицам, за исключением случаев, предусмотренных действующим законодательством Российской Федерации. Передача медиафайлов на сервера транскрибации Whisper осуществляется в зашифрованном виде без передачи идентификационных данных Субъекта (анонимизировано).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Срок действия и отзыв согласия</h2>
            <p>
              Настоящее согласие действует со дня его предоставления до дня его отзыва в письменной форме.
            </p>
            <p className="mt-2">
              Согласие может быть отозвано Субъектом путем отправки соответствующего письменного заявления на электронную почту Оператора: <span className="text-foreground">support@vox-transcribe.ru</span>. В случае отзыва согласия Оператор обязан прекратить обработку и уничтожить персональные данные в течение 30 дней с даты получения заявления.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
