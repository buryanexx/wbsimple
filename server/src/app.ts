import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { apiRoutes } from './routes';
import { redis } from './utils/redis.factory'; // Импортируем нашу фабрику Redis

// Загрузка переменных окружения
dotenv.config();

// Создание Express приложения
const app = express();
const port = parseInt(process.env.PORT || '5005', 10);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Создание директорий, если не существуют
const logDirectory = path.join(__dirname, '../logs');
const uploadDirectory = path.join(__dirname, '../uploads');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Статические файлы
app.use('/uploads', express.static(uploadDirectory));

// Маршрут проверки состояния
app.get('/health', (_req, res) => {
  // Проверяем также состояние Redis
  redis.ping()
    .then(() => {
      res.status(200).json({
        status: 'UP',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        redis: 'UP'
      });
    })
    .catch(() => {
      res.status(200).json({
        status: 'UP',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        redis: 'DOWN'
      });
    });
});

// Подключаем API маршруты
app.use('/api', apiRoutes);

// Обработка ошибок
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'ERROR',
    message: err.message || 'Внутренняя ошибка сервера'
  });
});

// Запуск сервера
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
    console.log(`👉 Проверка состояния: http://localhost:${port}/health`);
    console.log(`👉 API доступно по адресу: http://localhost:${port}/api`);
  });
}

export { app, redis }; 