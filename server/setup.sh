#!/bin/bash

# Обновление системы
echo "Обновление системы..."
apt-get update
apt-get upgrade -y

# Установка Node.js и npm
echo "Установка Node.js и npm..."
curl -sL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Установка PM2
echo "Установка PM2..."
npm install -g pm2

# Установка зависимостей проекта
echo "Установка зависимостей проекта..."
npm install

# Сборка проекта
echo "Сборка проекта..."
npm run build

# Запуск сервера с PM2
echo "Запуск сервера с PM2..."
pm2 start ecosystem.config.js

# Настройка автозапуска PM2
echo "Настройка автозапуска PM2..."
pm2 startup
pm2 save

echo "Настройка завершена! Сервер запущен с помощью PM2." 