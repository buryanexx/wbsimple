FROM node:18-alpine

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++

# Копируем только необходимые файлы для установки зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Компилируем TypeScript
RUN npm run build

# Открываем порт
EXPOSE 5005

# Запускаем приложение
CMD ["npm", "start"]