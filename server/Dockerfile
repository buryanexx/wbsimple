FROM node:18

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Устанавливаем типы TypeScript
RUN npm install --save-dev @types/node @types/express

# Компилируем TypeScript в JavaScript
RUN npm run build

# Открываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["npm", "start"] 