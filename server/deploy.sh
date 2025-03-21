#!/bin/bash

# Скрипт для деплоя WB Simple API
set -e

echo "🚀 Начинаем деплой WB Simple API..."

# Проверка наличия .env.production
if [ ! -f .env.production ]; then
    echo "⚠️ Файл .env.production не найден"
    echo "Создание .env.production из примера..."
    cp .env.example .env.production
    echo "⚠️ Не забудьте настроить переменные окружения в .env.production"
fi

# Проверка наличия директорий
mkdir -p logs uploads

# Генерация клиента Prisma
echo "🔄 Генерация клиента Prisma..."
npx prisma generate

# Сборка TypeScript
echo "🔄 Сборка TypeScript кода..."
npm run build

# Запуск контейнеров
echo "🔄 Запуск Docker контейнеров..."
docker-compose down || true
docker-compose up -d --build

# Ожидание запуска базы данных
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 10

# Проверка статуса контейнеров
echo "🔍 Проверка статуса контейнеров..."
docker-compose ps

echo "✅ Деплой WB Simple API успешно завершен!"
echo "📊 API доступен по адресу: http://localhost:5005"
echo "📊 Веб-интерфейс доступен по адресу: http://localhost:80"

# Инструкции для тестирования
echo ""
echo "📝 Для тестирования API:"
echo "curl http://localhost:5005/health"
echo ""
echo "📝 Логи API сервера:"
echo "docker-compose logs -f api"
echo ""
echo "📝 Для остановки сервисов:"
echo "docker-compose down" 