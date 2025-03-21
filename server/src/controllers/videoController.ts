import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import videoService from '../services/videoService.js';

/**
 * Получение защищенного URL для доступа к видео
 * @param req - Запрос Express
 * @param res - Ответ Express
 */
const getSecureVideoUrl = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const secureUrl = videoService.generateSecureUrl(videoId, userId.toString());
    
    res.json({ secureUrl });
  } catch (error) {
    console.error('Ошибка при получении защищенного URL для видео:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Потоковое воспроизведение видео с проверкой токена
 * @param req - Запрос Express
 * @param res - Ответ Express
 */
const streamVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { token, userId, expires, sid } = req.query as { 
      token: string, 
      userId: string, 
      expires: string, 
      sid: string 
    };

    // Проверяем наличие всех необходимых параметров
    if (!token || !userId || !expires || !sid) {
      return res.status(400).json({ message: 'Отсутствуют обязательные параметры' });
    }

    // Проверяем Referer
    const referer = req.headers.referer || '';
    
    // Проверяем User-Agent
    const userAgent = req.headers['user-agent'] || '';

    // Проверяем валидность токена
    const isValid = videoService.verifyVideoToken(
      videoId,
      userId,
      token,
      parseInt(expires, 10),
      referer,
      userAgent,
      sid
    );

    if (!isValid) {
      return res.status(403).json({ message: 'Недействительный токен доступа' });
    }

    // Получаем путь к файлу видео
    const videosDir = process.env.VIDEOS_DIR || path.join(process.cwd(), 'videos');
    const videoPath = path.join(videosDir, `${videoId}.mp4`);

    // Проверяем существование файла
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Видео не найдено' });
    }

    // Получаем размер файла
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Если указан диапазон байтов, отправляем только указанную часть
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      });
      
      file.pipe(res);
    } else {
      // Иначе отправляем весь файл
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      });
      
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Ошибка при стриминге видео:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Отметка видео как просмотренного
 * @param req - Запрос Express
 * @param res - Ответ Express
 */
const markVideoAsWatched = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { progress, lessonId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    if (!progress || !lessonId) {
      return res.status(400).json({ message: 'Отсутствуют обязательные параметры' });
    }

    await videoService.markVideoAsWatched(userId, videoId, parseInt(lessonId), progress);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при отметке видео как просмотренного:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Получение прогресса просмотра видео
 * @param req - Запрос Express
 * @param res - Ответ Express
 */
const getVideoProgress = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const progress = await videoService.getVideoProgress(userId, videoId);
    
    res.json({ progress });
  } catch (error) {
    console.error('Ошибка при получении прогресса просмотра видео:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export default {
  getSecureVideoUrl,
  streamVideo,
  markVideoAsWatched,
  getVideoProgress
}; 