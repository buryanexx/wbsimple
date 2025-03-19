# Настройка проекта WB Simple на Timeweb

Эта инструкция поможет настроить проект WB Simple на хостинге Timeweb.

## Шаг 1: Создание VPS на Timeweb

1. Войдите в личный кабинет Timeweb.
2. Выберите "VPS" и создайте новый сервер с Linux Ubuntu 20.04 LTS.
3. Рекомендуемые параметры:
   - CPU: минимум 2 ядра
   - RAM: минимум 4 ГБ
   - SSD: минимум 40 ГБ
4. Сохраните данные для доступа (IP-адрес, логин, пароль).

## Шаг 2: Настройка домена и SSL

1. В панели Timeweb перейдите в раздел "Домены" и добавьте новый домен или используйте существующий.
2. Создайте поддомены:
   - `api.wbsimple.ru` для бэкенда
   - `www.wbsimple.ru` для фронтенда (опционально)
3. Настройте DNS-записи, указав на IP-адрес вашего сервера:
   - Тип: A, Имя: api, Значение: IP-адрес сервера
   - Тип: A, Имя: www, Значение: IP-адрес сервера (если используете Timeweb и для фронтенда)

## Шаг 3: Настройка сервера

1. Подключитесь к серверу по SSH:
   ```bash
   ssh root@ваш_ip_адрес
   ```

2. Установите необходимое ПО:
   ```bash
   apt update && apt upgrade -y
   apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx git
   ```

3. Установите Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   npm install -g pm2
   ```

4. Настройте SSL-сертификат:
   ```bash
   certbot --nginx -d api.wbsimple.ru
   ```

## Шаг 4: Настройка базы данных PostgreSQL

1. Войдите в PostgreSQL:
   ```bash
   sudo -u postgres psql
   ```

2. Создайте пользователя и базу данных:
   ```sql
   CREATE USER wbsimple WITH PASSWORD 'your_password';
   CREATE DATABASE wbsimple;
   GRANT ALL PRIVILEGES ON DATABASE wbsimple TO wbsimple;
   \q
   ```

3. Обновите настройки PostgreSQL для доступа:
   ```bash
   nano /etc/postgresql/12/main/pg_hba.conf
   ```
   Добавьте строку:
   ```
   host    wbsimple        wbsimple        127.0.0.1/32            md5
   ```

4. Перезапустите PostgreSQL:
   ```bash
   systemctl restart postgresql
   ```

## Шаг 5: Настройка Nginx

1. Создайте конфигурацию для API:
   ```bash
   nano /etc/nginx/sites-available/api.wbsimple.ru
   ```

2. Добавьте следующее содержимое:
   ```nginx
   server {
       listen 80;
       server_name api.wbsimple.ru;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Активируйте конфигурацию:
   ```bash
   ln -s /etc/nginx/sites-available/api.wbsimple.ru /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

## Шаг 6: Деплой приложения

1. Создайте директорию для приложения:
   ```bash
   mkdir -p /var/www/wbsimple-api
   ```

2. Сделайте деплой с вашего локального компьютера, запустив скрипт:
   ```bash
   ./deploy-backend.sh
   ```
   
   Убедитесь, что в скрипте указаны правильные данные для доступа:
   ```bash
   # В файле deploy-backend.sh
   scp -r deploy/* root@ваш_ip_адрес:/var/www/wbsimple-api/
   ssh root@ваш_ip_адрес "cd /var/www/wbsimple-api && npm install --production && pm2 restart ecosystem.config.js"
   ```

## Шаг 7: Настройка фронтенда на Vercel

1. В файле .env.production укажите:
   ```
   VITE_API_URL=https://api.wbsimple.ru/api
   VITE_TELEGRAM_BOT_USERNAME=wbsimple_bot
   ```

2. Запустите деплой фронтенда:
   ```bash
   ./deploy-frontend.sh
   ```

## Шаг 8: Проверка работоспособности

1. Проверьте API:
   ```bash
   curl https://api.wbsimple.ru/api
   ```

2. Проверьте фронтенд, открыв в браузере:
   ```
   https://wbsimple.vercel.app
   ```

## Решение возможных проблем

### Проблема с базой данных

Если возникают ошибки при подключении к базе данных:

```bash
# Проверьте статус PostgreSQL
systemctl status postgresql

# Проверьте логи
tail -n 100 /var/log/postgresql/postgresql-12-main.log
```

### Проблема с Nginx

```bash
# Проверьте конфигурацию
nginx -t

# Проверьте логи
tail -n 100 /var/log/nginx/error.log
```

### Проблема с Node.js приложением

```bash
# Проверьте логи PM2
pm2 logs

# Перезапустите приложение
pm2 restart all
``` 