FROM node:18-alpine

# Создание рабочей директории
WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++

# Копирование файлов проекта
COPY package*.json ./
COPY tsconfig.json ./
COPY .env.production ./
COPY prisma ./prisma

# Установка зависимостей
RUN npm ci

# Генерация Prisma клиента
RUN npx prisma generate

# Копирование исходного кода
COPY src ./src

# Сборка TypeScript в JavaScript
RUN npm run build

# Создание директорий для данных
RUN mkdir -p logs uploads

# Скрипт запуска с миграциями
RUN echo "#!/bin/sh\n\
echo 'Waiting for PostgreSQL...'\n\
sleep 5\n\
npx prisma migrate deploy\n\
npm start" > /app/entrypoint.sh && \
chmod +x /app/entrypoint.sh

# Открытие порта
EXPOSE 5005

# Запуск приложения
CMD ["/app/entrypoint.sh"] 