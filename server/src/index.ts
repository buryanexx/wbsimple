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

// Маршрут для корневого пути API
app.get('/api', (req, res) => {
  res.json({
    message: 'WB Simple API работает',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/modules',
      '/api/lessons',
      '/api/subscriptions'
    ],
    status: 'online'
  });
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
    
    // Синхронизируем модели с базой данных
    await syncModels();
    
    // Инициализируем Telegram бота
    telegramService.startBot()
      .then(() => console.log('Telegram бот запущен'))
      .catch((error) => console.error('Ошибка запуска Telegram бота:', error));
    
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

startServer(); 