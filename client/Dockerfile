FROM node:18-alpine AS base

# Устанавливаем зависимости для сборки
FROM base AS deps
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm ci

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Создаем .env.production из .env.example, если не существует
RUN if [ ! -f .env.production ]; then cp .env.example .env.production; fi

# Сборка приложения
RUN npm run build

# Запуск приложения
FROM base AS runner
WORKDIR /app

# Устанавливаем переменные окружения
ENV NODE_ENV=production

# Копируем необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.env.production ./

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"] 