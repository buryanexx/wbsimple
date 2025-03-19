#!/bin/bash

# Убедимся, что скрипт остановится при ошибке
set -e

# Используем существующие настройки
TIMEWEB_USER="root"
TIMEWEB_IP="178.209.127.188"
SERVER_PATH="/opt/wbsimple-api"

echo "🚀 Начинаем деплой бэкенда на существующий сервер Timeweb..."

# Сборка проекта
echo "📦 Сборка бэкенда..."
cd server
npm run build

# Архивируем файлы для деплоя
echo "📁 Подготовка файлов для загрузки..."
mkdir -p deploy
cp -r dist package.json package-lock.json .env.production deploy/
mv deploy/.env.production deploy/.env
cp ecosystem.config.cjs deploy/

# Создаем директорию на сервере, если она не существует
echo "🔧 Подготовка директории на сервере..."
ssh ${TIMEWEB_USER}@${TIMEWEB_IP} "mkdir -p ${SERVER_PATH}"

# Загрузка на сервер по SSH
echo "📤 Загрузка на сервер Timeweb..."
scp -r deploy/* ${TIMEWEB_USER}@${TIMEWEB_IP}:${SERVER_PATH}/

# Установка PM2, если не установлен
echo "🔄 Проверка и установка PM2..."
ssh ${TIMEWEB_USER}@${TIMEWEB_IP} "command -v pm2 >/dev/null 2>&1 || npm install -g pm2"

# Перезапуск приложения на сервере
echo "🔄 Перезапуск приложения на сервере..."
ssh ${TIMEWEB_USER}@${TIMEWEB_IP} "cd ${SERVER_PATH} && npm install --production && pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs"

# Очистка временных файлов
echo "🧹 Очистка временных файлов..."
rm -rf deploy

echo "✅ Деплой бэкенда завершен!"
echo "🌐 API доступен по адресу: https://api.24wbsimple.ru/api" 