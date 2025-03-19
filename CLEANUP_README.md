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
