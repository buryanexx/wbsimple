#!/bin/bash

# Проверка наличия аргументов
if [ $# -ne 1 ]; then
  echo "Использование: $0 <ssh-адрес-сервера>"
  echo "Пример: $0 user@server.timeweb.ru"
  exit 1
fi

SERVER=$1
SERVER_DIR="/home/user/wbsimple-server"

# Сборка проекта
echo "Сборка проекта..."
cd server && npm run build

# Проверка успешности сборки
if [ $? -ne 0 ]; then
  echo "Ошибка при сборке проекта."
  exit 1
fi

# Создание архива для деплоя
echo "Создание архива для деплоя..."
cd ..
tar -czf server-deploy.tar.gz server/dist server/package.json server/package-lock.json server/.env.production server/ecosystem.config.js server/setup.sh

# Копирование файлов на сервер
echo "Копирование файлов на сервер..."
ssh $SERVER "mkdir -p $SERVER_DIR"
scp server-deploy.tar.gz $SERVER:$SERVER_DIR/

# Распаковка и настройка на сервере
echo "Распаковка и настройка на сервере..."
ssh $SERVER "cd $SERVER_DIR && tar -xzf server-deploy.tar.gz && mv server/* . && rm -rf server && rm server-deploy.tar.gz && mv .env.production .env && chmod +x setup.sh && ./setup.sh"

# Удаление локального архива
echo "Удаление локального архива..."
rm server-deploy.tar.gz

echo "Деплой завершен! Проверьте работу сервера." 