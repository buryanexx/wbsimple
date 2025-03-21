#!/bin/bash

# Скрипт для деплоя и запуска WB Simple API

# Устанавливаем цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Начинаем развертывание WB Simple API...${NC}"

# Проверяем установку Node.js и npm
echo -e "${YELLOW}Проверка установки Node.js и npm...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js не установлен. Пожалуйста, установите Node.js 18 или выше.${NC}"
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Версия Node.js должна быть 18 или выше. Текущая версия: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js $(node -v) установлен.${NC}"
echo -e "${GREEN}npm $(npm -v) установлен.${NC}"

# Проверяем наличие Docker
echo -e "${YELLOW}Проверка установки Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен. Рекомендуется установить Docker для запуска в контейнерах.${NC}"
    echo -e "${YELLOW}Продолжаем установку без Docker...${NC}"
    USE_DOCKER=false
else
    echo -e "${GREEN}Docker $(docker --version) установлен.${NC}"
    USE_DOCKER=true
    
    # Проверяем наличие docker-compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}docker-compose не установлен. Пожалуйста, установите docker-compose.${NC}"
        USE_DOCKER=false
    else
        echo -e "${GREEN}docker-compose $(docker-compose --version) установлен.${NC}"
    fi
fi

# Создаем директории для данных
echo -e "${YELLOW}Создание директорий для данных...${NC}"
mkdir -p videos
mkdir -p logs

# Проверяем наличие файлов окружения
if [ ! -f .env.production ]; then
    echo -e "${RED}Файл .env.production не найден. Создаем из шаблона...${NC}"
    cp .env.example .env.production
    echo -e "${YELLOW}Пожалуйста, отредактируйте файл .env.production с вашими настройками.${NC}"
fi

# Установка зависимостей
echo -e "${YELLOW}Установка зависимостей...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при установке зависимостей.${NC}"
    exit 1
fi

# Сборка проекта
echo -e "${YELLOW}Сборка проекта...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при сборке проекта.${NC}"
    exit 1
fi

# Запуск в зависимости от наличия Docker
if [ "$USE_DOCKER" = true ]; then
    echo -e "${YELLOW}Запуск с использованием Docker...${NC}"
    cd docker
    docker-compose up -d
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при запуске контейнеров Docker.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Контейнеры Docker успешно запущены.${NC}"
    echo -e "${GREEN}API доступен по адресу: http://localhost:5005${NC}"
else
    echo -e "${YELLOW}Запуск без использования Docker...${NC}"
    echo -e "${YELLOW}Не забудьте запустить PostgreSQL и Redis отдельно.${NC}"
    npm start
fi

echo -e "${GREEN}Развертывание WB Simple API завершено успешно!${NC}" 