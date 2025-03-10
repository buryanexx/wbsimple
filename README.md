# WB Simple - Образовательная платформа

WB Simple - это образовательная платформа, интегрированная с Telegram, которая позволяет пользователям проходить обучающие модули и уроки.

## Технологии

### Фронтенд
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Telegram Web App API

### Бэкенд
- Node.js
- Express
- TypeScript
- PostgreSQL
- Sequelize ORM
- JWT для аутентификации
- Telegram Bot API

## Установка и запуск

### Требования
- Node.js 18+
- PostgreSQL 14+
- Telegram Bot

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/wbsimple.git
cd wbsimple
```

2. Установите зависимости для фронтенда:
```bash
npm install
```

3. Установите зависимости для бэкенда:
```bash
cd server
npm install
```

4. Настройте переменные окружения:
   - Создайте файл `.env.development` в корневой директории для фронтенда
   - Создайте файл `.env.development` в директории `server` для бэкенда

5. Запустите бэкенд:
```bash
cd server
npm run dev
```

6. Запустите фронтенд:
```bash
# В корневой директории
npm run dev
```

## Деплой

### Бэкенд (Timeweb Cloud)
1. Создайте виртуальный сервер на Timeweb Cloud
2. Настройте PostgreSQL базу данных
3. Загрузите код на сервер
4. Запустите скрипт настройки:
```bash
cd server
chmod +x setup.sh
./setup.sh
```

### Фронтенд (GitHub Pages)
1. Настройте переменные окружения в `.env.production`
2. Запустите команду деплоя:
```bash
npm run deploy
```

## Структура проекта

### Фронтенд
- `src/components` - React компоненты
- `src/contexts` - React контексты
- `src/hooks` - Пользовательские хуки
- `src/pages` - Страницы приложения
- `src/services` - Сервисы для работы с API
- `src/types` - TypeScript типы

### Бэкенд
- `src/controllers` - Контроллеры для обработки запросов
- `src/models` - Модели данных
- `src/routes` - Маршруты API
- `src/services` - Бизнес-логика
- `src/middleware` - Промежуточное ПО
- `src/utils` - Утилиты

## Лицензия
MIT
