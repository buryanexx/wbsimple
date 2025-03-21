import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import config from '../config';

const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);

/**
 * Контроллер для управления обратной связью
 */
export class FeedbackController {
  /**
   * Отправка обратной связи
   */
  async submitFeedback(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { rating, comment, lessonId, moduleId } = req.body;
      
      // Проверка обязательных полей
      if (rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Необходимо указать корректный рейтинг от 1 до 5' });
      }
      
      // Проверка, что указан либо урок, либо модуль (или ничего - общий отзыв)
      if (lessonId && moduleId) {
        return res.status(400).json({ error: 'Можно указать либо lessonId, либо moduleId, но не оба' });
      }
      
      // Если указан урок, проверяем его существование
      if (lessonId) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: lessonId }
        });
        
        if (!lesson) {
          return res.status(404).json({ error: 'Указанный урок не найден' });
        }
      }
      
      // Если указан модуль, проверяем его существование
      if (moduleId) {
        const module = await prisma.module.findUnique({
          where: { id: moduleId }
        });
        
        if (!module) {
          return res.status(404).json({ error: 'Указанный модуль не найден' });
        }
      }
      
      // Проверяем, не оставлял ли пользователь уже отзыв
      const existingFeedback = await prisma.feedback.findFirst({
        where: {
          userId,
          ...(lessonId ? { lessonId } : {}),
          ...(moduleId ? { moduleId } : {})
        }
      });
      
      if (existingFeedback) {
        // Обновляем существующий отзыв
        const updatedFeedback = await prisma.feedback.update({
          where: { id: existingFeedback.id },
          data: {
            rating,
            comment,
            updatedAt: new Date()
          }
        });
        
        logger.info('Feedback updated', { 
          feedbackId: updatedFeedback.id, 
          userId, 
          lessonId, 
          moduleId 
        });
        
        return res.status(200).json({
          message: 'Отзыв успешно обновлен',
          feedback: updatedFeedback
        });
      }
      
      // Создаем новый отзыв
      const feedback = await prisma.feedback.create({
        data: {
          rating,
          comment,
          userId,
          lessonId,
          moduleId
        }
      });
      
      logger.info('Feedback submitted', { 
        feedbackId: feedback.id, 
        userId, 
        lessonId, 
        moduleId 
      });
      
      return res.status(201).json({
        message: 'Отзыв успешно отправлен',
        feedback
      });
    } catch (error) {
      logger.error('Error submitting feedback', { error, userId: (req as any).user?.id });
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
  
  /**
   * Получение отзывов (только для админов)
   */
  async getFeedbacks(req: Request, res: Response) {
    try {
      const { lessonId, moduleId, userId } = req.query;
      
      // Формируем параметры запроса
      const queryParams: any = {
        where: {
          ...(lessonId ? { lessonId: lessonId as string } : {}),
          ...(moduleId ? { moduleId: moduleId as string } : {}),
          ...(userId ? { userId: userId as string } : {})
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              photoUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      };
      
      // Получаем отзывы из базы данных
      const feedbacks = await prisma.feedback.findMany(queryParams);
      
      return res.status(200).json(feedbacks);
    } catch (error) {
      logger.error('Error getting feedbacks', { error, query: req.query });
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
  
  /**
   * Удаление отзыва (только для админов или автора отзыва)
   */
  async deleteFeedback(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const isAdmin = (req as any).user.role === 'ADMIN';
      
      // Проверяем существование отзыва
      const feedback = await prisma.feedback.findUnique({
        where: { id }
      });
      
      if (!feedback) {
        return res.status(404).json({ error: 'Отзыв не найден' });
      }
      
      // Проверяем права на удаление
      if (!isAdmin && feedback.userId !== userId) {
        logger.warn('Unauthorized attempt to delete feedback', { 
          feedbackId: id, 
          requestUserId: userId, 
          feedbackUserId: feedback.userId 
        });
        return res.status(403).json({ error: 'Нет прав на удаление этого отзыва' });
      }
      
      // Удаляем отзыв
      await prisma.feedback.delete({
        where: { id }
      });
      
      logger.info('Feedback deleted', { feedbackId: id, deletedBy: userId });
      
      return res.status(200).json({ message: 'Отзыв успешно удален' });
    } catch (error) {
      logger.error('Error deleting feedback', { error, feedbackId: req.params.id });
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
} 