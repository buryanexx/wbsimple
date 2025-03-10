import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './config/database.js';
import { syncModels } from './models/index.js';
import telegramService from './services/telegramService.js';
import authRoutes from './routes/authRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

// Загружаем переменные окружения в зависимости от NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'WB Simple API' });
});

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Запуск сервера
const startServer = async () => {
  try {
    // Проверяем подключение к базе данных
    await testDatabaseConnection();
    
    // Синхронизируем модели с базой данных (только в режиме разработки)
    await syncModels();
    
    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      
      // Запускаем Telegram бота
      telegramService.startBot()
        .then(() => console.log('Telegram бот запущен'))
        .catch((error: Error) => console.error('Ошибка запуска Telegram бота:', error));
    });
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer(); 