import { app } from './app';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

// Определение порта
const port = process.env.PORT || 5005;

// Запуск сервера
const server = app.listen(port, () => {
  console.log(`🚀 Сервер запущен на порту ${port}`);
  console.log(`👉 Проверка состояния: http://localhost:${port}/health`);
  console.log(`👉 API доступно по адресу: http://localhost:${port}/api/modules`);
});

// Обработка сигналов для graceful shutdown
const gracefulShutdown = () => {
  console.log('Получен сигнал завершения, закрываем соединения...');
  
  server.close(() => {
    console.log('HTTP сервер закрыт');
    process.exit(0);
  });
  
  // Если через 10 секунд сервер все еще не закрыт, принудительно завершаем процесс
  setTimeout(() => {
    console.error('Принудительное завершение через таймаут');
    process.exit(1);
  }, 10000);
};

// Регистрация обработчиков сигналов
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown); 