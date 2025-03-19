#!/bin/bash

# Убедимся, что скрипт останавливается при ошибке
set -e

echo "🚀 Начинаем настройку сервера для WB Simple..."

# Установка необходимых пакетов
echo "📦 Установка необходимых пакетов..."
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx git

# Установка Node.js и PM2
echo "📦 Установка Node.js и PM2..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2

# Создание директории для приложения
echo "📁 Создание директории для приложения..."
mkdir -p /var/www/wbsimple-api

# Настройка Nginx
echo "🔧 Настройка Nginx..."
cat > /etc/nginx/sites-available/api.wbsimple.ru << 'EOF'
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
EOF

# Активируем конфигурацию
ln -sf /etc/nginx/sites-available/api.wbsimple.ru /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Запрос SSL-сертификата
echo "🔒 Запрос SSL-сертификата..."
read -p "Хотите настроить SSL-сертификат для api.wbsimple.ru? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ]; then
    certbot --nginx -d api.wbsimple.ru
    echo "✅ SSL-сертификат настроен!"
else
    echo "⏭️ Пропускаем настройку SSL-сертификата"
fi

echo "✅ Настройка сервера завершена!"
echo "🚀 Теперь вы можете запустить деплой бэкенда с помощью ./deploy-backend.sh" 