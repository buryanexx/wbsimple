#!/bin/bash

# Скрипт для локального запуска WB Simple без Docker
set -e

echo "🚀 Локальный запуск системы WB Simple..."

# Проверка наличия Node.js
if ! [ -x "$(command -v node)" ]; then
  echo "❌ Ошибка: Node.js не установлен" >&2
  echo "Установите Node.js с https://nodejs.org/"
  exit 1
fi

# Проверка наличия npm
if ! [ -x "$(command -v npm)" ]; then
  echo "❌ Ошибка: npm не установлен" >&2
  echo "Установите npm с https://nodejs.org/"
  exit 1
fi

# Проверка наличия .env файлов
if [ ! -f ./server/.env ]; then
    echo "⚠️ Файл ./server/.env не найден"
    echo "Создание из примера..."
    
    if [ -f ./server/.env.example ]; then
        cp ./server/.env.example ./server/.env
        echo "✅ Создан ./server/.env"
    else
        echo "❌ Ошибка: ./server/.env.example не найден"
        exit 1
    fi
fi

if [ ! -f ./client/.env ]; then
    echo "⚠️ Файл ./client/.env не найден"
    echo "Создание из примера..."
    
    if [ -f ./client/.env.example ]; then
        cp ./client/.env.example ./client/.env
        echo "✅ Создан ./client/.env"
    else
        echo "❌ Ошибка: ./client/.env.example не найден"
        exit 1
    fi
fi

# Установка зависимостей сервера
echo "📦 Установка зависимостей сервера..."
cd server
npm install

# Проверка наличия PostgreSQL
echo "🔍 Проверка доступности PostgreSQL..."
if ! nc -z localhost 5432 > /dev/null 2>&1; then
    echo "⚠️ PostgreSQL не запущен или не доступен на порту 5432"
    echo "⚠️ API сервер будет запущен, но функциональность будет ограничена"
    echo "⚠️ Для полной функциональности установите и запустите PostgreSQL:"
    echo "  Mac: brew install postgresql && brew services start postgresql"
    echo "  Ubuntu: sudo apt install postgresql && sudo systemctl start postgresql"
    echo "  Windows: Скачайте и установите с https://www.postgresql.org/download/windows/"
    
    # Модификация .env для использования SQLite вместо PostgreSQL, если это поддерживается проектом
    echo "⚠️ Попытка переключения на SQLite..."
    sed -i -e 's|DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|g' .env
else
    # Генерация клиента Prisma
    echo "✅ PostgreSQL доступен"
    echo "🔄 Генерация клиента Prisma..."
    npx prisma generate
    
    # Инициализация базы данных (если необходимо)
    echo "🔄 Запуск миграций базы данных..."
    npx prisma migrate dev --name init || {
        echo "⚠️ Ошибка при выполнении миграций. Возможно, база данных не создана."
        echo "⚠️ Попытка создания базы данных..."
        
        # Попытка создать базу данных
        if [ -x "$(command -v psql)" ]; then
            psql -h localhost -U postgres -c "CREATE DATABASE wbsimple;" || echo "⚠️ Не удалось создать базу данных. Проверьте настройки PostgreSQL."
            npx prisma migrate dev --name init || echo "⚠️ Миграции не удались. Проверьте настройки в .env файле."
        else
            echo "⚠️ Утилита psql не найдена. Используйте PGAdmin или аналогичный инструмент для создания базы данных."
        fi
    }
fi

echo "✅ Зависимости сервера установлены"

# Запуск сервера
echo "🔄 Запуск API сервера в отдельном процессе..."
npm run dev &
SERVER_PID=$!
echo "✅ API сервер запущен, PID: $SERVER_PID"

# Возврат в основную директорию
cd ..

# Установка зависимостей клиента
echo "📦 Установка зависимостей клиента..."
cd client
npm install
echo "✅ Зависимости клиента установлены"

# Запуск клиента
echo "🔄 Запуск клиента..."
npm run dev &
CLIENT_PID=$!
echo "✅ Клиент запущен, PID: $CLIENT_PID"

# Возврат в основную директорию
cd ..

echo "✅ Система WB Simple успешно запущена!"
echo ""
echo "📊 API доступен по адресу: http://localhost:5005"
echo "📊 Веб-интерфейс доступен по адресу: http://localhost:3000"
echo ""
echo "⚠️ Для остановки сервисов нажмите Ctrl+C или выполните:"
echo "kill $SERVER_PID $CLIENT_PID"

# Обработка завершения работы
trap "kill $SERVER_PID $CLIENT_PID; exit" INT TERM EXIT

# Ожидание нажатия Ctrl+C
wait 