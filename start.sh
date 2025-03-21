#!/bin/bash

# Скрипт для запуска всей системы WB Simple
set -e

echo "🚀 Запуск системы WB Simple..."

# Проверка наличия docker и docker-compose
if ! [ -x "$(command -v docker)" ]; then
  echo "❌ Ошибка: Docker не установлен" >&2
  echo "Установите Docker с https://docs.docker.com/get-docker/"
  exit 1
fi

if ! [ -x "$(command -v docker-compose)" ]; then
  echo "❌ Ошибка: Docker Compose не установлен" >&2
  echo "Установите Docker Compose с https://docs.docker.com/compose/install/"
  exit 1
fi

# Проверка наличия файлов окружения
if [ ! -f ./server/.env.production ]; then
    echo "⚠️ Файл ./server/.env.production не найден"
    echo "Создание из примера..."
    
    if [ -f ./server/.env.example ]; then
        cp ./server/.env.example ./server/.env.production
        echo "✅ Создан ./server/.env.production"
    else
        echo "❌ Ошибка: ./server/.env.example не найден"
        exit 1
    fi
fi

if [ ! -f ./client/.env.production ]; then
    echo "⚠️ Файл ./client/.env.production не найден"
    echo "Создание из примера..."
    
    if [ -f ./client/.env.example ]; then
        cp ./client/.env.example ./client/.env.production
        echo "✅ Создан ./client/.env.production"
    else
        echo "❌ Ошибка: ./client/.env.example не найден"
        exit 1
    fi
fi

# Установка прав на выполнение скриптов
chmod +x ./server/deploy.sh
chmod +x ./client/deploy.sh

# Запуск контейнеров с пересборкой
echo "🔄 Запуск Docker контейнеров..."
docker-compose down || true
docker-compose up -d --build

# Проверка статуса
echo "⏳ Ожидание запуска всех сервисов..."
sleep 10

# Вывод статуса
echo "🔍 Статус контейнеров:"
docker-compose ps

echo "✅ Система WB Simple успешно запущена!"
echo ""
echo "📊 API доступен по адресу: http://localhost:5005"
echo "📊 Веб-интерфейс доступен по адресу: http://localhost:80"
echo ""
echo "📝 Для просмотра логов выполните:"
echo "docker-compose logs -f"
echo ""
echo "📝 Для остановки системы выполните:"
echo "docker-compose down" 