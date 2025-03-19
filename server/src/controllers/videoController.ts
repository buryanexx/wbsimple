import { Request, Response } from 'express';
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
  markVideoAsWatched,
  getVideoProgress
}; 