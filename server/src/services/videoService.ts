import { User, VideoProgress } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Загружаем переменные окружения
dotenv.config();

// Директория для хранения видео
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(process.cwd(), 'videos');

// Базовый URL для доступа к видео
const VIDEO_BASE_URL = process.env.VIDEO_BASE_URL || 'http://localhost:5005/videos';

// Секретный ключ для JWT
const SECRET_KEY = process.env.JWT_SECRET || 'wb-simple-secret-key';

// Время жизни токена в секундах (15 минут - уменьшено для большей безопасности)
const TOKEN_EXPIRY = 900;

// Разрешенные домены для Referer
const ALLOWED_DOMAINS = [
  'localhost',
  't.me',
  'web.telegram.org',
  'wbsimple.vercel.app'
];

/**
 * Генерирует защищенный URL для доступа к видео
 * @param videoId - ID видео
 * @param userId - ID пользователя
 * @returns Защищенный URL для доступа к видео
 */
const generateSecureUrl = (videoId: string, userId: string): string => {
  // Время истечения токена
  const expires = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY;
  
  // Генерируем уникальный идентификатор сессии для отслеживания утечек
  const sessionId = crypto.randomBytes(16).toString('hex');
  
  // Генерируем токен с дополнительными данными для проверки
  const token = jwt.sign(
    { 
      videoId, 
      userId, 
      expires,
      sessionId,
      // Добавляем хэш для дополнительной защиты
      fingerprint: crypto.createHash('sha256').update(`${videoId}:${userId}:${sessionId}:${SECRET_KEY}`).digest('hex')
    },
    SECRET_KEY,
    { expiresIn: TOKEN_EXPIRY }
  );
  
  // Формируем URL с параметрами
  const secureUrl = `${VIDEO_BASE_URL}/${videoId}?token=${token}&userId=${userId}&expires=${expires}&sid=${sessionId}`;
  
  // Логируем создание токена для доступа к видео (для мониторинга)
  console.log(`Создан токен для доступа к видео ${videoId} для пользователя ${userId}, истекает через ${TOKEN_EXPIRY} секунд`);
  
  return secureUrl;
};

/**
 * Отмечает видео как просмотренное и обновляет прогресс пользователя
 * @param userId - ID пользователя
 * @param videoId - ID видео
 * @param lessonId - ID урока
 * @param progress - Прогресс просмотра (0-100)
 */
const markVideoAsWatched = async (
  userId: number,
  videoId: string,
  lessonId: number,
  progress: number
): Promise<void> => {
  try {
    // Находим или создаем запись о прогрессе просмотра
    const [videoProgress, created] = await VideoProgress.findOrCreate({
      where: { userId, videoId },
      defaults: { userId, videoId, progress, lastWatched: new Date() }
    });
    
    // Если запись уже существует, обновляем прогресс
    if (!created) {
      videoProgress.progress = progress;
      videoProgress.lastWatched = new Date();
      await videoProgress.save();
    }
    
    // Если прогресс больше 90%, отмечаем урок как завершенным
    if (progress >= 90) {
      const user = await User.findByPk(userId);
      if (user) {
        // Инициализируем прогресс, если он не существует
        if (!user.progress) {
          user.progress = {
            completedLessons: [],
            completedModules: []
          };
        }
        
        // Добавляем урок в список завершенных, если его там еще нет
        if (!user.progress.completedLessons.includes(lessonId)) {
          user.progress.completedLessons.push(lessonId);
          await user.save();
        }
      }
    }
  } catch (error) {
    console.error('Ошибка при отметке видео как просмотренного:', error);
    throw new Error('Не удалось отметить видео как просмотренное');
  }
};

/**
 * Получает прогресс просмотра видео
 * @param userId - ID пользователя
 * @param videoId - ID видео
 * @returns Прогресс просмотра (0-100)
 */
const getVideoProgress = async (userId: number, videoId: string): Promise<number> => {
  try {
    // Находим запись о прогрессе просмотра
    const videoProgress = await VideoProgress.findOne({
      where: { userId, videoId }
    });
    
    // Возвращаем прогресс или 0, если запись не найдена
    return videoProgress ? videoProgress.progress : 0;
  } catch (error) {
    console.error('Ошибка при получении прогресса просмотра видео:', error);
    throw new Error('Не удалось получить прогресс просмотра видео');
  }
};

/**
 * Проверяет валидность токена для доступа к видео
 * @param videoId - ID видео
 * @param userId - ID пользователя
 * @param token - Токен доступа
 * @param expires - Время истечения токена
 * @param referer - HTTP referer для проверки источника запроса
 * @param userAgent - User-Agent для проверки клиента
 * @param sessionId - Уникальный идентификатор сессии
 * @returns true, если токен валиден, иначе false
 */
const verifyVideoToken = (
  videoId: string,
  userId: string,
  token: string,
  expires: number,
  referer?: string,
  userAgent?: string,
  sessionId?: string
): boolean => {
  try {
    // Проверяем, не истек ли токен
    if (expires < Math.floor(Date.now() / 1000)) {
      console.warn(`Попытка доступа с истекшим токеном: ${videoId}, пользователь: ${userId}`);
      return false;
    }
    
    // Проверяем referer, если он передан
    if (referer) {
      const isAllowedReferer = ALLOWED_DOMAINS.some(domain => referer.includes(domain));
      if (!isAllowedReferer) {
        console.warn(`Доступ запрещен из-за недопустимого referer: ${referer}`);
        return false;
      }
    }
    
    // Проверяем User-Agent на подозрительные паттерны
    if (userAgent) {
      const suspiciousPatterns = [
        'wget', 'curl', 'python-requests', 'ruby', 'scrapy', 'phantomjs', 'headless'
      ];
      const isSuspiciousAgent = suspiciousPatterns.some(pattern => 
        userAgent.toLowerCase().includes(pattern.toLowerCase())
      );
      if (isSuspiciousAgent) {
        console.warn(`Доступ запрещен из-за подозрительного User-Agent: ${userAgent}`);
        return false;
      }
    }
    
    // Проверяем подпись токена
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
    
    // Проверяем, что данные в токене соответствуют запрошенным
    const isValidToken = (
      decoded.videoId === videoId &&
      decoded.userId === userId &&
      decoded.expires === expires
    );
    
    // Если передан sessionId, проверяем его соответствие
    if (sessionId && decoded.sessionId && sessionId !== decoded.sessionId) {
      console.warn(`Несоответствие идентификатора сессии: ${sessionId} != ${decoded.sessionId}`);
      return false;
    }
    
    // Проверяем дополнительный хэш для защиты от подделки токена
    if (decoded.fingerprint) {
      const expectedFingerprint = crypto.createHash('sha256')
        .update(`${videoId}:${userId}:${decoded.sessionId}:${SECRET_KEY}`)
        .digest('hex');
      
      if (decoded.fingerprint !== expectedFingerprint) {
        console.warn('Недействительный fingerprint токена');
        return false;
      }
    }
    
    // Если токен недействителен, логируем это
    if (!isValidToken) {
      console.warn(`Недействительный токен для видео ${videoId}, пользователь: ${userId}`);
    }
    
    return isValidToken;
  } catch (error) {
    console.error('Ошибка при проверке токена видео:', error);
    return false;
  }
};

export default {
  generateSecureUrl,
  markVideoAsWatched,
  getVideoProgress,
  verifyVideoToken
}; 