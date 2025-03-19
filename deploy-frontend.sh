#!/bin/bash

# Убедимся, что скрипт остановится при ошибке
set -e

echo "🚀 Начинаем деплой фронтенда на Vercel..."

# Сборка проекта
echo "📦 Сборка проекта..."
npm run build

# Если установлен Vercel CLI, используем его
if command -v vercel &> /dev/null; then
    echo "🔄 Деплой на Vercel..."
    vercel --prod
else
    echo "⚠️ Vercel CLI не установлен. Устанавливаем..."
    npm install -g vercel
    echo "🔄 Деплой на Vercel..."
    vercel --prod
fi

echo "✅ Деплой фронтенда завершен!"
echo "🌐 Проверьте ваше приложение на https://wbsimple.vercel.app" 