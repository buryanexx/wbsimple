# WB Simple - Бэкенд

Бэкенд для образовательной платформы WB Simple - Telegram Mini App для обучения заработку на Wildberries.

## Технологии

- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- JWT для аутентификации
- Telegram Bot API
- Telegram Payments API

## Структура проекта

```
src/
  ├── config/         # Конфигурация приложения
  ├── controllers/    # Контроллеры для обработки запросов
  ├── middleware/     # Промежуточное ПО (middleware)
  ├── models/         # Модели данных Mongoose
  ├── routes/         # Маршруты API
  ├── services/       # Сервисы для бизнес-логики
  ├── utils/          # Вспомогательные утилиты
  └── index.ts        # Точка входа в приложение
```

## Установка и запуск

1. Установите зависимости:

```bash
npm install
```

2. Создайте файл `.env` в корне проекта и заполните его:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wbsimple
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_PAYMENT_TOKEN=your_telegram_payment_token
```

3. Запустите MongoDB (локально или используйте MongoDB Atlas).

4. Заполните базу данных тестовыми данными:

```bash
npm run seed
```

5. Запустите сервер в режиме разработки:

```bash
npm run dev
```

## API Endpoints

### Аутентификация

- `POST /api/auth/telegram` - Аутентификация пользователя Telegram
- `GET /api/auth/me` - Получение данных текущего пользователя

### Модули

- `GET /api/modules` - Получение всех модулей
- `GET /api/modules/:moduleId` - Получение модуля по ID
- `POST /api/modules` - Создание нового модуля (для админов)
- `PUT /api/modules/:moduleId` - Обновление модуля (для админов)
- `DELETE /api/modules/:moduleId` - Удаление модуля (для админов)
- `POST /api/modules/:moduleId/complete` - Отметка модуля как завершенного

### Уроки

- `GET /api/lessons/module/:moduleId` - Получение всех уроков модуля
- `GET /api/lessons/:moduleId/:lessonId` - Получение урока по ID
- `POST /api/lessons` - Создание нового урока (для админов)
- `PUT /api/lessons/:moduleId/:lessonId` - Обновление урока (для админов)
- `DELETE /api/lessons/:moduleId/:lessonId` - Удаление урока (для админов)
- `POST /api/lessons/:moduleId/:lessonId/complete` - Отметка урока как завершенного

### Шаблоны

- `GET /api/templates` - Получение всех шаблонов
- `GET /api/templates/categories` - Получение категорий шаблонов
- `GET /api/templates/:templateId` - Получение шаблона по ID
- `GET /api/templates/:templateId/download` - Скачивание шаблона
- `POST /api/templates` - Создание нового шаблона (для админов)
- `PUT /api/templates/:templateId` - Обновление шаблона (для админов)
- `DELETE /api/templates/:templateId` - Удаление шаблона (для админов)

### Подписки

- `GET /api/subscriptions/info` - Получение информации о подписке пользователя
- `POST /api/subscriptions` - Создание новой подписки
- `POST /api/subscriptions/cancel-auto-renewal` - Отмена автопродления подписки
- `POST /api/subscriptions/enable-auto-renewal` - Включение автопродления подписки
- `POST /api/subscriptions/webhook` - Обработка webhook от Telegram Payments 