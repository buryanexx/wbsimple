import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import telegramService from './services/telegramService.js';

// Импорт маршрутов
import authRoutes from './routes/authRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

// Загрузка переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

// Инициализация Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'WB Simple API' });
});

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ошибка сервера' });
});

// Запуск сервера
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  
  // Запуск Telegram бота
  try {
    await telegramService.startBot();
  } catch (error) {
    console.error('Ошибка запуска Telegram бота:', error);
  }
}); 