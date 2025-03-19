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
import videoRoutes from './routes/videoRoutes.js';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from './middleware/auth.js';
import videoService from './services/videoService.js';

// Загружаем переменные окружения в зависимости от NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}

const app = express();
const PORT = process.env.PORT || 5005;

// Директория для хранения видео
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(process.cwd(), 'videos');

// Создаем директорию для видео, если она не существует
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

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
      '/api/subscriptions',
      '/api/videos'
    ],
    status: 'online'
  });
});

// Маршрут для доступа к видеофайлам с проверкой токена
app.get('/videos/:videoId', (req, res) => {
  try {
    const { videoId } = req.params;
    const { token, userId, expires, sid } = req.query;
    const referer = req.headers.referer;
    const userAgent = req.headers['user-agent'];
    
    // Проверяем токен с дополнительными параметрами безопасности
    if (!token || !userId || !expires || 
        !videoService.verifyVideoToken(
          videoId, 
          userId as string, 
          token as string, 
          Number(expires),
          referer,
          userAgent,
          sid as string
        )) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }
    
    // Путь к видеофайлу
    const videoPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);
    
    // Проверяем, существует ли файл
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Видео не найдено' });
    }
    
    // Получаем размер файла
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // Если запрос содержит заголовок Range, отправляем часть файла
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      
      file.pipe(res);
    } else {
      // Если запрос не содержит заголовок Range, отправляем весь файл
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      });
      
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Ошибка при доступе к видео:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/videos', videoRoutes);

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