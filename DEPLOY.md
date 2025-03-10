# Инструкция по деплою WB Simple

Эта инструкция поможет вам развернуть проект WB Simple на продакшн-серверах.

## Шаг 1: Подготовка репозитория GitHub

1. Создайте новый репозиторий на GitHub
2. Инициализируйте Git в вашем проекте (если еще не сделано):
   ```bash
   git init
   ```
3. Добавьте все файлы в репозиторий:
   ```bash
   git add .
   ```
4. Создайте первый коммит:
   ```bash
   git commit -m "Initial commit"
   ```
5. Добавьте удаленный репозиторий:
   ```bash
   git remote add origin https://github.com/your-username/wbsimple.git
   ```
6. Отправьте код в репозиторий:
   ```bash
   git push -u origin main
   ```

## Шаг 2: Настройка MongoDB Atlas

1. Создайте аккаунт на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Создайте новый кластер (бесплатный M0 подойдет для начала)
3. Настройте доступ к базе данных:
   - Создайте пользователя базы данных с паролем
   - Настройте Network Access (добавьте IP 0.0.0.0/0 для доступа отовсюду)
4. Получите строку подключения, которая будет выглядеть примерно так:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/wbsimple
   ```

## Шаг 3: Деплой бэкенда на Render

1. Создайте аккаунт на [Render](https://render.com)
2. Нажмите "New" и выберите "Web Service"
3. Подключите ваш GitHub репозиторий
4. Настройте следующие параметры:
   - Name: wbsimple-api
   - Environment: Node
   - Root Directory: server
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. В разделе "Environment Variables" добавьте следующие переменные:
   - `PORT`: 5000
   - `NODE_ENV`: production
   - `MONGODB_URI`: строка подключения к MongoDB Atlas
   - `JWT_SECRET`: сгенерируйте случайную строку для JWT
   - `TELEGRAM_BOT_TOKEN`: токен вашего Telegram бота
   - `TELEGRAM_PAYMENT_TOKEN`: токен для платежей через Telegram
   - `WEBAPP_URL`: оставьте пустым, заполните после деплоя фронтенда
6. Нажмите "Create Web Service"
7. Дождитесь завершения деплоя и скопируйте URL вашего API (например, https://wbsimple-api.onrender.com)

## Шаг 4: Деплой фронтенда на Vercel

1. Создайте аккаунт на [Vercel](https://vercel.com)
2. Нажмите "Add New" и выберите "Project"
3. Подключите ваш GitHub репозиторий
4. Настройте следующие параметры:
   - Framework Preset: Vite
   - Root Directory: оставьте пустым (корень проекта)
5. В разделе "Environment Variables" добавьте следующие переменные:
   - `VITE_API_URL`: URL вашего API + "/api" (например, https://wbsimple-api.onrender.com/api)
   - `VITE_TELEGRAM_BOT_USERNAME`: имя вашего бота без символа @ (wbsimple_bot)
6. Нажмите "Deploy"
7. Дождитесь завершения деплоя и скопируйте URL вашего фронтенда (например, https://wbsimple.vercel.app)

## Шаг 5: Обновление WEBAPP_URL в бэкенде

1. Вернитесь в панель управления Render
2. Найдите ваш сервис wbsimple-api
3. Перейдите в раздел "Environment"
4. Обновите переменную `WEBAPP_URL` с URL вашего фронтенда
5. Нажмите "Save Changes"
6. Дождитесь перезапуска сервиса

## Шаг 6: Заполнение базы данных

1. После успешного деплоя бэкенда на Render, вам нужно заполнить базу данных начальными данными
2. Для этого вы можете использовать Render Shell или запустить скрипт локально:

   **Вариант 1: Использование Render Shell**
   1. В панели управления Render найдите ваш сервис wbsimple-api
   2. Перейдите в раздел "Shell"
   3. Выполните команду:
      ```bash
      npm run seed:prod
      ```

   **Вариант 2: Запуск скрипта локально**
   1. Создайте файл `.env.production.local` в директории `server` с вашими продакшн-переменными окружения
   2. Запустите скрипт:
      ```bash
      cd server
      NODE_ENV=production npm run seed:prod
      ```

3. Проверьте, что данные успешно добавлены в базу данных MongoDB Atlas

## Шаг 7: Настройка Telegram Mini App

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/mybots` и выберите вашего бота
3. Нажмите "Bot Settings" -> "Menu Button" -> "Configure menu button"
4. Введите URL вашего фронтенда (например, https://wbsimple.vercel.app)
5. Вернитесь в настройки бота и нажмите "Bot Settings" -> "Domain"
6. Добавьте домен вашего фронтенда (например, wbsimple.vercel.app)

## Шаг 8: Настройка Telegram Payments

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/mybots` и выберите вашего бота
3. Нажмите "Bot Settings" -> "Payments"
4. Выберите платежную систему (например, "Stripe TEST" для тестирования)
5. Получите платежный токен
6. Вернитесь в панель управления Render
7. Обновите переменную `TELEGRAM_PAYMENT_TOKEN` с полученным токеном
8. Нажмите "Save Changes"
9. Дождитесь перезапуска сервиса

## Проверка деплоя

1. Откройте вашего бота в Telegram
2. Отправьте команду `/start`
3. Нажмите на кнопку меню для открытия Mini App
4. Проверьте, что приложение открывается и работает корректно
5. Проверьте функциональность подписки и платежей 