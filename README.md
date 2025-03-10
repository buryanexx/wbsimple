# WB Simple - Telegram Mini App

Образовательная платформа для обучения заработку на Wildberries с нуля до 1.000.000 рублей.

## Описание проекта

WB Simple - это Telegram Mini App, которое предоставляет пользователям доступ к образовательному контенту по заработку на маркетплейсе Wildberries. Приложение включает в себя модульную структуру курса, библиотеку шаблонов и фишек для продавцов, а также доступ к закрытому Telegram-каналу для подписчиков.

## Технологии

### Frontend
- React + TypeScript
- Tailwind CSS
- React Router
- Telegram Web App API
- Vite

### Backend
- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- JWT для аутентификации
- Telegram Bot API
- Telegram Payments API

## Структура проекта

```
/
├── src/                # Frontend (React)
│   ├── components/     # Компоненты React
│   ├── pages/          # Страницы приложения
│   ├── hooks/          # Пользовательские хуки
│   ├── services/       # Сервисы для работы с API
│   ├── types/          # TypeScript типы
│   └── utils/          # Вспомогательные утилиты
│
└── server/             # Backend (Node.js + Express)
    ├── src/
    │   ├── config/     # Конфигурация приложения
    │   ├── controllers/# Контроллеры для обработки запросов
    │   ├── middleware/ # Промежуточное ПО (middleware)
    │   ├── models/     # Модели данных Mongoose
    │   ├── routes/     # Маршруты API
    │   ├── services/   # Сервисы для бизнес-логики
    │   ├── utils/      # Вспомогательные утилиты
    │   └── index.ts    # Точка входа в приложение
    └── README.md       # Документация бэкенда
```

## Установка и запуск

### Frontend

1. Установите зависимости:

```bash
npm install
```

2. Запустите приложение в режиме разработки:

```bash
npm run dev
```

### Backend

1. Перейдите в директорию сервера:

```bash
cd server
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env` в корне директории сервера и заполните его:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wbsimple
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_PAYMENT_TOKEN=your_telegram_payment_token
```

4. Запустите MongoDB (локально или используйте MongoDB Atlas).

5. Заполните базу данных тестовыми данными:

```bash
npm run seed
```

6. Запустите сервер в режиме разработки:

```bash
npm run dev
```

## Функциональность

### Основные возможности

- Образовательная платформа с модульной структурой курса по Wildberries
- Библиотека шаблонов и фишек для продавцов
- Кнопка для перехода в закрытый Telegram-канал (для подписчиков)
- Система единой ежемесячной подписки с оплатой через Telegram Payments

### Структура образовательного контента

- 8 основных модулей по Wildberries (от регистрации до масштабирования)
- Видеоуроки, интерактивные задания, тесты с автопроверкой
- Библиотека шаблонов (карточки товаров, скрипты для поставщиков и т.д.)

## Интеграция с Telegram

Для интеграции с Telegram необходимо:

1. Создать бота через @BotFather
2. Получить токен бота
3. Настроить Telegram Mini App через @BotFather
4. Настроить Telegram Payments для приема платежей

Подробная инструкция по настройке находится в [официальной документации Telegram](https://core.telegram.org/bots/webapps).

## Деплой проекта

### Деплой фронтенда на Vercel

1. Создайте аккаунт на [Vercel](https://vercel.com) (если у вас его еще нет)
2. Подключите ваш GitHub репозиторий к Vercel
3. Настройте переменные окружения в панели управления Vercel:
   - `VITE_API_URL` - URL вашего API (например, https://wbsimple-api.onrender.com/api)
   - `VITE_TELEGRAM_BOT_USERNAME` - имя вашего бота без символа @ (wbsimple_bot)
4. Запустите деплой

### Деплой бэкенда на Render

1. Создайте аккаунт на [Render](https://render.com) (если у вас его еще нет)
2. Создайте новый Web Service и подключите ваш GitHub репозиторий
3. Настройте следующие параметры:
   - Name: wbsimple-api
   - Environment: Node
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
4. Настройте переменные окружения:
   - `PORT` - 5000
   - `NODE_ENV` - production
   - `MONGODB_URI` - URI вашей MongoDB базы данных
   - `JWT_SECRET` - секретный ключ для JWT
   - `TELEGRAM_BOT_TOKEN` - токен вашего Telegram бота
   - `TELEGRAM_PAYMENT_TOKEN` - токен для платежей через Telegram
   - `WEBAPP_URL` - URL вашего фронтенда (например, https://wbsimple.vercel.app)
5. Запустите деплой

### Настройка MongoDB Atlas

1. Создайте аккаунт на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Создайте новый кластер (бесплатный M0 подойдет для начала)
3. Настройте доступ к базе данных:
   - Создайте пользователя базы данных
   - Настройте Network Access (добавьте IP 0.0.0.0/0 для доступа отовсюду)
4. Получите строку подключения и добавьте ее в переменные окружения на Render

### Настройка Telegram Mini App

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/mybots` и выберите вашего бота
3. Нажмите "Bot Settings" -> "Menu Button" -> "Configure menu button"
4. Введите URL вашего фронтенда (например, https://wbsimple.vercel.app)
5. Вернитесь в настройки бота и нажмите "Bot Settings" -> "Domain"
6. Добавьте домен вашего фронтенда (например, wbsimple.vercel.app)

### Настройка Telegram Payments

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/mybots` и выберите вашего бота
3. Нажмите "Bot Settings" -> "Payments"
4. Выберите платежную систему (например, "Stripe TEST" для тестирования)
5. Получите платежный токен и добавьте его в переменные окружения на Render

## Лицензия

MIT

## Настройка Telegram бота и Mini App

### 1. Настройка бота через BotFather

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/mybots` и выберите вашего бота
3. Нажмите "Bot Settings" -> "Payments" и выберите платежную систему (например, "Stripe TEST" для тестирования)
4. Скопируйте полученный платежный токен и вставьте его в файл `server/.env` в переменную `TELEGRAM_PAYMENT_TOKEN`
5. Вернитесь в настройки бота и нажмите "Bot Settings" -> "Menu Button" -> "Configure menu button"
6. Введите URL вашего приложения (например, `https://your-domain.com` или `http://localhost:5173` для локальной разработки)

### 2. Настройка Mini App

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/mybots` и выберите вашего бота
3. Нажмите "Bot Settings" -> "Menu Button" -> "Configure menu button"
4. Введите URL вашего приложения (например, `https://your-domain.com` или `http://localhost:5173` для локальной разработки)
5. Вернитесь в настройки бота и нажмите "Bot Settings" -> "Domain"
6. Добавьте домен вашего приложения (например, `your-domain.com` или `localhost` для локальной разработки)

### 3. Обновление переменных окружения

1. Откройте файл `.env` в корне проекта и обновите переменную `VITE_TELEGRAM_BOT_USERNAME` с именем вашего бота (без символа @)
2. Откройте файл `server/.env` и убедитесь, что переменные `TELEGRAM_BOT_TOKEN` и `TELEGRAM_PAYMENT_TOKEN` заполнены правильно
3. В файле `server/.env` обновите переменную `WEBAPP_URL` с URL вашего фронтенд-приложения (например, `http://localhost:5173` для локальной разработки)

### 4. Запуск приложения

1. Запустите сервер:
```bash
cd server
npm install
npm run dev
```

2. Запустите фронтенд:
```bash
npm install
npm run dev
```

3. Откройте вашего бота в Telegram и нажмите кнопку меню для запуска Mini App

## Дополнительная информация

### Структура проекта

- `server/` - Бэкенд на Express.js с TypeScript
- `src/` - Фронтенд на React с TypeScript
- `server/.env` - Переменные окружения для бэкенда
- `.env` - Переменные окружения для фронтенда

### API Endpoints

- `POST /api/auth/telegram` - Аутентификация через Telegram
- `GET /api/auth/me` - Получение информации о текущем пользователе
- `GET /api/modules` - Получение списка модулей
- `GET /api/modules/:id` - Получение информации о модуле
- `GET /api/lessons/:id` - Получение информации о уроке
- `POST /api/lessons/:id/complete` - Отметить урок как завершенный
- `GET /api/templates` - Получение списка шаблонов
- `GET /api/templates/:id` - Получение информации о шаблоне
- `GET /api/subscription` - Получение информации о подписке
- `POST /api/subscription` - Создание новой подписки
- `PUT /api/subscription/cancel` - Отмена автопродления подписки
- `PUT /api/subscription/enable` - Включение автопродления подписки
- `POST /api/subscription/webhook` - Webhook для обработки платежей

### Telegram Bot API

Бот поддерживает следующие команды:
- `/start` - Начать работу с ботом
- `/help` - Показать справку
- `/subscription` - Информация о подписке
