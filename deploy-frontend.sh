#!/bin/bash

# Проверка наличия изменений в Git
if [ -n "$(git status --porcelain)" ]; then
  echo "Есть незакоммиченные изменения. Пожалуйста, закоммитьте их перед деплоем."
  exit 1
fi

# Сборка проекта
echo "Сборка проекта..."
npm run build

# Проверка успешности сборки
if [ $? -ne 0 ]; then
  echo "Ошибка при сборке проекта."
  exit 1
fi

# Деплой на GitHub Pages
echo "Деплой на GitHub Pages..."
npm run deploy

echo "Деплой завершен! Проверьте ваш сайт через несколько минут." 