"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Mic, 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  Check, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Clock 
} from "lucide-react"

// FAQ items
const faqData = [
  {
    question: "Какая точность распознавания речи у вашего ИИ?",
    answer: "Точность распознавания составляет до 98-99% для качественных аудиозаписей без сильного фонового шума. Мы используем передовую модель Whisper Large-v2, которая отлично справляется с терминами, акцентами и автоматически расставляет знаки препинания."
  },
  {
    question: "Какие форматы файлов вы поддерживаете?",
    answer: "Мы поддерживаем все популярные аудио- и видеоформаты: MP3, WAV, M4A, MP4, MOV, AVI, MKV. Максимальный размер загружаемого файла для бесплатного тарифа — 50 МБ, для Pro и Business — до 2 ГБ."
  },
  {
    question: "Насколько безопасны мои данные?",
    answer: "Безопасность — наш главный приоритет. Вся обработка файлов происходит на наших серверах на территории РФ. Файлы шифруются при передаче и хранении, не передаются третьим лицам и могут быть полностью удалены вами в любой момент из личного кабинета."
  },
  {
    question: "Могу ли я транскрибировать видео напрямую с YouTube?",
    answer: "Да, конечно. Вам нужно лишь вставить ссылку на видео с YouTube или Vimeo в личном кабинете, выбрать язык, и наша система автоматически скачает звуковую дорожку и выполнит транскрибацию."
  },
  {
    question: "Как работает списание минут на Free тарифе?",
    answer: "Каждому новому пользователю при регистрации начисляется 30 бесплатных минут транскрибации. Баланс обновляется раз в месяц. Если вам нужно больше времени, вы всегда можете перейти на тариф Pro (10 часов) или Business."
  }
]

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  // Тарифные цены в рублях
  const prices = {
    pro: billingPeriod === "month" ? 790 : 650, // 7900 в год -> ~650/мес
    business: billingPeriod === "month" ? 2990 : 2490, // 29900 в год -> ~2490/мес
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      
      {/* Header / Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/50 bg-card/45 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-md shadow-primary/20">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            VOX
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Возможности</a>
          <a href="#workflow" className="hover:text-foreground transition-colors">Как это работает</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Тарифы</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link 
            href="/login" 
            className="hidden sm:inline-flex text-sm font-semibold hover:text-primary transition-colors py-2 px-3"
          >
            Войти
          </Link>
          <Link 
            href="/register" 
            className="inline-flex text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all"
          >
            Регистрация
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 sm:px-12 lg:px-24 text-center space-y-8 flex flex-col items-center">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 dark:bg-primary/5" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary animate-pulse mb-4">
          <Sparkles className="h-3.5 w-3.5" /> VIP ИИ-транскрибация по 152-ФЗ РФ
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15]">
          Превращайте аудио и видео <br />
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            в текст за пару кликов
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Профессиональная VIP платформа для автоматического распознавания речи. Загружайте файлы или вставляйте ссылки на YouTube. Быстрый экспорт в TXT, PDF, DOCX и субтитры SRT/VTT.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-base flex items-center justify-center gap-2 group"
          >
            Попробовать бесплатно
            <Zap className="h-5 w-5 text-yellow-300 group-hover:scale-110 transition-transform" />
          </Link>
          <a 
            href="#pricing" 
            className="w-full sm:w-auto px-8 py-4 border border-border bg-card/60 backdrop-blur hover:bg-accent text-foreground font-semibold rounded-xl transition-all text-base"
          >
            Тарифные планы
          </a>
        </div>

        {/* Hero mockup mock */}
        <div className="w-full max-w-5xl mt-16 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl p-4 sm:p-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span>VOX / Панель управления</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="h-28 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-4">
                <Upload className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-semibold">Перетащите файл сюда или нажмите для выбора</span>
                <span className="text-xs text-muted-foreground mt-1">MP3, WAV, MP4, MOV (до 2 ГБ)</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="flex-1 px-3 py-2 border border-border bg-background/50 rounded-lg text-sm text-muted-foreground focus:outline-none" 
                />
                <button className="px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-lg border border-border">Импорт</button>
              </div>
            </div>
            <div className="border border-border/60 rounded-xl p-4 bg-background/30 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Тариф: Free</span>
                  <span className="text-xs py-0.5 px-2 rounded-full bg-secondary text-foreground">30 мин</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[45%]" />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Использовано: 13.5 мин</span>
                  <span>Осталось: 16.5 мин</span>
                </div>
              </div>
              <Link href="/register" className="mt-4 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-center rounded-lg text-sm transition-colors">
                Купить Pro тариф
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 sm:px-12 lg:px-24 bg-secondary/20 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Умные возможности платформы</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Мы разработали все необходимые инструменты для быстрой и точной расшифровки любой речи.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Загрузка файлов</h3>
              <p className="text-sm text-muted-foreground">
                Поддержка практически любых форматов медиафайлов. Просто перетащите аудио или видео, и начнется мгновенная расшифровка.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <LinkIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Распознавание по URL</h3>
              <p className="text-sm text-muted-foreground">
                Вставьте ссылку на YouTube, Vimeo или прямую ссылку на медиафайл. Наш сервис сам извлечет аудио и расшифрует его.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Множество форматов экспорта</h3>
              <p className="text-sm text-muted-foreground">
                Экспортируйте полученный текст в форматы TXT, DOCX, PDF, а также в субтитры SRT и VTT с точными таймкодами.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-6 sm:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Как это работает? всего 3 простых шага</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Процесс от загрузки аудио до готового текста занимает минимум вашего времени.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="space-y-3 text-center p-6 relative">
              <div className="h-12 w-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xl mx-auto shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold">Загрузите файл или укажите URL</h3>
              <p className="text-sm text-muted-foreground">
                Выберите аудио/видеофайл с компьютера или вставьте ссылку на YouTube видео.
              </p>
            </div>

            <div className="space-y-3 text-center p-6 relative">
              <div className="h-12 w-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xl mx-auto shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold">ИИ выполняет распознавание</h3>
              <p className="text-sm text-muted-foreground">
                Наша Whisper модель с высокой точностью преобразует речь в текст, расставит пунктуацию.
              </p>
            </div>

            <div className="space-y-3 text-center p-6 relative">
              <div className="h-12 w-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xl mx-auto shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold">Проверяйте и скачивайте результат</h3>
              <p className="text-sm text-muted-foreground">
                Редактируйте готовый текст с синхронизацией по таймкодам и скачивайте в нужном формате.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 sm:px-12 lg:px-24 bg-secondary/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Тарифные планы</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Выберите подходящий тариф в зависимости от ваших объемов задач. Экономьте до 20% при годовой оплате.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-2.5 p-1 rounded-xl bg-card border border-border mt-4">
              <button
                onClick={() => setBillingPeriod("month")}
                className={`py-2 px-4 text-sm font-semibold rounded-lg transition-all ${billingPeriod === "month" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Оплата помесячно
              </button>
              <button
                onClick={() => setBillingPeriod("year")}
                className={`py-2 px-4 text-sm font-semibold rounded-lg transition-all ${billingPeriod === "year" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Оплата за год
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl border border-border bg-card/65 backdrop-blur flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-muted-foreground">Free</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">0₽</span>
                    <span className="text-sm text-muted-foreground">/всегда</span>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> 30 минут транскрибации в месяц</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Базовый экспорт (только TXT)</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Загрузка файлов до 50 МБ</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Ограниченная история (последние 5)</li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 w-full py-3 bg-secondary hover:bg-accent text-foreground font-semibold text-center rounded-xl transition-all">
                Начать бесплатно
              </Link>
            </div>

            {/* Pro Plan (VIP card) */}
            <div className="p-8 rounded-2xl border-2 border-primary bg-card flex flex-col justify-between relative shadow-xl shadow-primary/5">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 py-1 px-3 rounded-full bg-primary text-xs font-bold text-primary-foreground">
                Популярный
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary">Pro</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{prices.pro}₽</span>
                    <span className="text-sm text-muted-foreground">/месяц</span>
                  </div>
                  {billingPeriod === "year" && <span className="text-[11px] text-emerald-500 font-semibold">Списание 7 900₽ раз в год</span>}
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> 10 часов транскрибации в месяц</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Экспорт во все форматы (PDF, DOCX, SRT, VTT)</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Приоритетная обработка очередей</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Полная история транскрипций</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Поддержка файлов до 2 ГБ</li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-center rounded-xl shadow-md shadow-primary/10 transition-all">
                Оформить Pro подписку
              </Link>
            </div>

            {/* Business Plan */}
            <div className="p-8 rounded-2xl border border-border bg-card/65 backdrop-blur flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-muted-foreground">Business</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{prices.business}₽</span>
                    <span className="text-sm text-muted-foreground">/месяц</span>
                  </div>
                  {billingPeriod === "year" && <span className="text-[11px] text-emerald-500 font-semibold">Списание 29 900₽ раз в год</span>}
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Безлимитная транскрибация</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> API доступ для интеграций</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Командный аккаунт (до 10 человек)</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Выделенный сервер Whisper API</li>
                  <li className="flex items-center gap-2"><Check className="h-4.5 w-4.5 text-primary" /> Персональная VIP поддержка 24/7</li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 w-full py-3 bg-secondary hover:bg-accent text-foreground font-semibold text-center rounded-xl transition-all">
                Начать Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 sm:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Часто задаваемые вопросы</h2>
            <p className="text-muted-foreground">
              Не нашли ответ? Свяжитесь с нами через почту поддержки.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div 
                key={i} 
                className="border border-border bg-card/40 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold hover:text-primary transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${openFaqIndex === i ? "rotate-180 text-primary" : ""}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${openFaqIndex === i ? "max-h-[300px] border-t border-border/50" : "max-h-0"}`}
                >
                  <p className="p-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/30 py-12 px-6 sm:px-12 lg:px-24 text-sm text-muted-foreground">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">VOX</span>
            </div>
            <p className="text-xs">
              VIP ИИ-распознавание речи с локальным шифрованием и соответствием 152-ФЗ РФ.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-foreground transition-colors">Возможности</a></li>
              <li><a href="#workflow" className="hover:text-foreground transition-colors">Как это работает</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Тарифы</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Юридические документы</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Политика конфиденциальности</Link></li>
              <li><Link href="/personal-data-consent" className="hover:text-foreground transition-colors">Согласие на обработку ПД</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-foreground transition-colors">Пользовательское соглашение</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-foreground transition-colors">Использование cookies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Контакты</h4>
            <p className="text-xs mb-2">ООО «ВОКС ТЕХНОЛОГИИ»</p>
            <p className="text-xs mb-2">ОГРН: 1267700000000</p>
            <p className="text-xs text-foreground">support@vox-transcribe.ru</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-border/40 pt-6 text-center text-xs">
          © {new Date().getFullYear()} VOX. Все права защищены.
        </div>
      </footer>
    </div>
  )
}
