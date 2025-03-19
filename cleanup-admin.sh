#!/bin/bash

# Скрипт для удаления админ-компонентов из проекта

echo "Начинаю очистку проекта от админ-компонентов..."

# Создаем бэкап структуры директорий перед удалением
echo "Создаю бэкап структуры директорий..."
mkdir -p backup
find . -type d -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" -not -path "*/.git/*" -not -path "*/backup/*" > backup/directories.txt
find . -type f -name "*.tsx" -o -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" -not -path "*/.git/*" -not -path "*/backup/*" > backup/files.txt

# Список директорий для удаления
echo "Удаляю директории админ-компонентов..."
rm -rf admin
rm -rf wbsimple-admin
rm -rf server/wbsimple-admin

# Удаление админ-компонентов из src/pages
echo "Удаляю админ-компоненты из src/pages..."
rm -rf src/pages/Dashboard
rm -rf src/pages/Modules
rm -rf src/pages/Lessons
rm -rf src/pages/Media
rm -rf src/pages/Users
rm -rf src/pages/Analytics
rm -rf src/pages/Login

# Удаление админ-компонентов из src/components
echo "Удаляю админ-компоненты из src/components..."
rm -rf src/components/Layout

# Удаление админ-контекста
echo "Удаляю админ-контекст..."
rm -f src/contexts/AuthContext.tsx

# Создание файла README с пояснениями
echo "Создаю README с пояснениями..."
cat > CLEANUP_README.md << EOL
# Очистка проекта от админ-компонентов

В проекте были удалены следующие компоненты и директории, относящиеся к админ-панели:

1. Директории:
   - admin/
   - wbsimple-admin/
   - server/wbsimple-admin/
   - src/pages/Dashboard/
   - src/pages/Modules/
   - src/pages/Lessons/
   - src/pages/Media/
   - src/pages/Users/
   - src/pages/Analytics/
   - src/pages/Login/
   - src/components/Layout/

2. Файлы:
   - src/contexts/AuthContext.tsx

## Бэкап
Перед удалением была создана директория backup/ с файлами:
- directories.txt - список всех директорий проекта
- files.txt - список всех .ts и .tsx файлов проекта

## Структура проекта после очистки
Текущая структура проекта содержит только клиентские компоненты Telegram Mini App:
- src/pages/ - страницы клиентского приложения
- src/components/ - компоненты клиентского приложения
- src/hooks/ - хуки клиентского приложения
- src/services/ - сервисы для работы с API
- server/src/ - серверная часть приложения
EOL

echo "Очистка завершена успешно!"
echo "Подробная информация в файле CLEANUP_README.md" 