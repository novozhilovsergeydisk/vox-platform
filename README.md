# VOX Platform — VIP Платформа транскрибации аудио и видео (SaaS)

Современная VIP-платформа для автоматической транскрибации аудио- и видеоконтента. Проект построен как pnpm-монорепозиторий на базе Next.js 15 и фонового воркера BullMQ с локальной обработкой Whisper (Python) и нативной базой данных PostgreSQL.

---

## 🛠️ Стек технологий

*   **Frontend & API:** Next.js 15 (App Router, Server Components), TypeScript, Tailwind CSS, Framer Motion, next-themes.
*   **Аутентификация:** NextAuth.js v5 (Credentials Strategy).
*   **База данных:** PostgreSQL 15+ (нативный драйвер `pg` без ORM), пул соединений `pg.Pool`.
*   **Очереди & Фоновые задачи:** Redis + BullMQ (Node.js).
*   **Транскрибация:** Python 3 + `faster-whisper` (локально) / OpenAI Whisper API (облако).
*   **Сборка & Управление пакетами:** pnpm Workspaces.

---

## 📂 Структура монорепозитория

```text
├── apps/
│   ├── web/                # Next.js 15 веб-приложение (лендинг, кабинет, API)
│   └── worker/             # Node.js фоновый обработчик очередей BullMQ
├── packages/
│   └── db/                 # Общий модуль подключения к PostgreSQL
├── services/
│   └── transcription/      # ИИ-модуль транскрибации (Python-скрипт Whisper)
├── schema.sql              # Схема структуры базы данных для PostgreSQL
├── pnpm-workspace.yaml     # Конфигурация воркспейсов pnpm
└── log-task                # Скрипт биллинга и учета задач AI
```

---

## 🚀 Локальное развертывание

### 1. Требования
Убедитесь, что в системе установлены:
*   Node.js v20+
*   pnpm v10+
*   PostgreSQL v15+
*   Redis v6.2.0+ (критически важно для работы BullMQ, версии ниже 6.2.0 вызывают предупреждения/ошибки)
*   Python v3.10+ (с утилитой `pip3`)

### 2. Установка зависимостей монорепозитория
Установите все npm-пакеты для всех воркспейсов из корня проекта:
```bash
pnpm install
```

### 3. Настройка Python-окружения для Whisper
Установите необходимые библиотеки для работы локального распознавания речи:
```bash
pip3 install -r services/transcription/requirements.txt
```
*Примечание: Если библиотеки не установлены, проект запустится в mock-режиме (имитация распознавания).*

### 4. Настройка переменных окружения
Скопируйте пример файла конфигурации:
```bash
cp .env.example .env
```
Заполните `.env` файл в корне проекта:
```env
# База данных PostgreSQL (macOS: postgres без пароля)
DATABASE_URL="postgresql://postgres@localhost:5432/transcription"

# Подключение к Redis (для BullMQ)
REDIS_URL="redis://localhost:6379"

# Секретный ключ для сессий NextAuth (сгенерируйте любой)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-it"

# Опционально: Ключ OpenAI (для облачного распознавания, если локальный Whisper отключен)
OPENAI_API_KEY=""

# Настройки размера модели (tiny, base, small, medium, large-v2)
WHISPER_MODEL="base"
```
*Примечание: Символические ссылки на корневой `.env` в пакетах `apps/web/` и `packages/db/` создаются автоматически.*

### 5. Инициализация базы данных
Создайте локальную базу данных и накатите структуру таблиц:
```bash
# Создание базы данных (если не создана)
psql -U postgres -c "CREATE DATABASE transcription;"

# Накат структуры таблиц, триггеров и индексов
psql -U postgres -d transcription -f schema.sql
```

### 6. Запуск Redis
Убедитесь, что Redis запущен. На macOS:
```bash
redis-server --daemonize yes
```

### 7. Запуск в режиме разработки
Для запуска веб-приложения и фонового воркера параллельно выполните:
```bash
pnpm dev
```
*   Веб-приложение будет доступно на: [http://localhost:3000](http://localhost:3000)
*   Воркер начнет слушать очередь в текущем окне терминала.

Также можно запускать их по отдельности в разных вкладках:
```bash
pnpm dev:web     # Только Next.js
pnpm dev:worker  # Только воркер BullMQ
```

---

## 🧪 Тестирование и Сборка

### Валидация типов и Сборка проекта
Для компиляции TypeScript-файлов воркера и сборки Next.js приложения запустите:
```bash
pnpm build
```
Команда собирает:
1.  `packages/db` — компилирует JS-клиент.
2.  `apps/worker` — компилирует TS-воркер в `/dist`.
3.  `apps/web` — запускает `next build` для генерации production статики.

---

## 🎛️ Развертывание на сервере (VPS)

### 1. Установка и обновление Redis (до версии 6.2.0+)
BullMQ критически зависит от функций Redis, появившихся в версии **6.2.0** и выше (включая команды LMOVE и т.д.). В стандартных репозиториях старых версий Ubuntu/Debian может поставляться Redis v6.0.8, который будет вызывать предупреждения.

Чтобы обновить Redis до актуальной версии на Linux-сервере:
```bash
# Добавление официального репозитория Redis
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list

# Обновление списков пакетов и установка
sudo apt update
sudo apt install redis-server -y

# Перезапуск службы и добавление в автозапуск
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Проверка установленной версии
redis-server --version
```

### 2. Настройка Systemd сервисов (System Unit)
Для обеспечения бесперебойной работы приложения в фоне на Linux-сервере (Ubuntu/Debian) используются службы Systemd.

#### A. Веб-приложение (Next.js на порту 3005 или 3007)
Создайте файл сервиса `/etc/systemd/system/vox-web.service`:
```ini
[Unit]
Description=VOX Web Application
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/vox-platform
Environment=NODE_ENV=production PORT=3005
ExecStart=/usr/bin/pnpm --filter @transcription/web start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```
*Если порт 3005 занят, измените `PORT=3005` на `PORT=3007`.*

#### B. Фоновый воркер транскрибации
Создайте файл сервиса `/etc/systemd/system/vox-worker.service`:
```ini
[Unit]
Description=VOX Queue Worker
After=network.target redis-server.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/vox-platform
Environment=NODE_ENV=production
ExecStart=/usr/bin/pnpm --filter @transcription/worker start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### C. Управление службами
```bash
# Перезапуск демона systemd для загрузки новых служб
sudo systemctl daemon-reload

# Запуск и включение автозапуска для веб-приложения
sudo systemctl start vox-web
sudo systemctl enable vox-web

# Запуск и включение автозапуска для воркера
sudo systemctl start vox-worker
sudo systemctl enable vox-worker

# Проверка статуса служб
sudo systemctl status vox-web
sudo systemctl status vox-worker
```

### 3. Настройка Nginx в качестве Reverse Proxy
Nginx будет принимать внешние запросы на портах 80/443 и перенаправлять их на локальный порт `3005` (или `3007`) нашего Next.js приложения.

Создайте конфигурационный файл `/etc/nginx/sites-available/vox-platform`:
```nginx
server {
    listen 80;
    server_name your-domain.ru www.your-domain.ru;

    # Максимальный размер загружаемого файла (видео до 2 ГБ)
    client_max_body_size 2048M;

    location / {
        proxy_pass http://127.0.0.1:3005; # Измените на 3007, если используется этот порт
        proxy_http_version 1.1;
        
        # Поддержка WebSockets и Keep-Alive
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Передача реальных IP адресов
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Логи доступа и ошибок
    access_log /var/log/nginx/vox_access.log;
    error_log /var/log/nginx/vox_error.log;
}
```

Активируйте конфигурацию и перезапустите Nginx:
```bash
# Создание символической ссылки в sites-enabled
sudo ln -s /etc/nginx/sites-available/vox-platform /etc/nginx/sites-enabled/

# Проверка конфигурации Nginx на синтаксические ошибки
sudo nginx -t

# Перезапуск веб-сервера
sudo systemctl restart nginx
```

### 4. Установка SSL сертификата (Let's Encrypt)
Для шифрования трафика (HTTPS) используйте Certbot:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Получение и автонастройка SSL
sudo certbot --nginx -d your-domain.ru -d www.your-domain.ru
```
Certbot автоматически перепишет конфигурацию Nginx для редиректа с HTTP на HTTPS и настроит автопродление сертификата.
