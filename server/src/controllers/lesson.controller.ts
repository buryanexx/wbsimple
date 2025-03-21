import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import config from '../config';
import { redis } from '../utils/redis.factory';

const prisma = new PrismaClient();
const redisClient = new Redis(config.redis.url);

/**
 * Контроллер для управления уроками
 */
export class LessonController {
  private readonly CACHE_PREFIX = 'lesson:';
  
  /**
   * Получение списка уроков модуля
   */
  async getLessonsByModule(req: Request, res: Response) {
    try {
      const { moduleId } = req.params;
      const isAdmin = (req as any).user?.role === 'ADMIN';
      
      // Проверяем кэш для неадминов
      if (!isAdmin) {
        const cacheKey = `module:${moduleId}:lessons`;
        const cachedLessons = await redisClient.get(cacheKey);
        
        if (cachedLessons) {
          return res.status(200).json(JSON.parse(cachedLessons));
        }
      }
      
      // Сначала проверяем существование модуля
      const module = await prisma.module.findUnique({
        where: { id: moduleId }
      });
      
      if (!module) {
        return res.status(404).json({ error: 'Модуль не найден' });
      }
      
      // Проверяем доступность модуля для неадминов
      if (!isAdmin && !module.isPublished) {
        return res.status(404).json({ error: 'Модуль не найден' });
      }
      
      // Получаем уроки из базы данных
      const lessons = await prisma.lesson.findMany({
        where: {
          moduleId,
          // Для обычных пользователей показываем только опубликованные уроки
          ...(isAdmin ? {} : { isPublished: true })
        },
        orderBy: { order: 'asc' }
      });
      
      // Кэшируем результат для неадминов
      if (!isAdmin) {
        await redisClient.set(
          `module:${moduleId}:lessons`,
          JSON.stringify(lessons),
          'EX',
          3600 // 1 час
        );
      }
      
      return res.status(200).json(lessons);
    } catch (error) {
      logger.error('Error getting lessons by module', { error, moduleId: req.params.moduleId });
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
  
  /**
   * Получение урока по ID
   */
  async getLessonById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isAdmin = (req as any).user?.role === 'ADMIN';
      
      // Проверяем кэш для неадминов
      if (!isAdmin) {
        const cacheKey = `lesson:${id}`;
        const cachedLesson = await redisClient.get(cacheKey);
        
        if (cachedLesson) {
          return res.status(200).json(JSON.parse(cachedLesson));
        }
      }
      
      // Получаем урок из базы данных с информацией о модуле
      const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              isPublished: true
            }
          }
        }
      });
      
      if (!lesson) {
        return res.status(404).json({ error: 'Урок не найден' });
      }
      
      // Для неадминов проверяем доступность урока и модуля
      if (!isAdmin && (!lesson.isPublished || !lesson.module.isPublished)) {
        return res.status(404).json({ error: 'Урок не найден' });
      }
      
      // Кэшируем результат для неадминов
      if (!isAdmin && lesson.isPublished && lesson.module.isPublished) {
        await redisClient.set(
          `lesson:${id}`,
          JSON.stringify(lesson),
          'EX',
          3600 // 1 час
        );
      }
      
      return res.status(200).json(lesson);
    } catch (error) {
      logger.error('Error getting lesson by id', { error, lessonId: req.params.id });
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
  
  /**
   * Получение информации об уроке
   */
  async getLesson(req: Request, res: Response): Promise<void> {
    try {
      const lessonId = parseInt(req.params.id);
      
      // Проверяем валидность параметра
      if (isNaN(lessonId)) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Неверный формат ID урока'
        });
        return;
      }
      
      // Проверяем кэш
      const cachedLesson = await redisClient.get(`${this.CACHE_PREFIX}${lessonId}`);
      if (cachedLesson) {
        const lesson = JSON.parse(cachedLesson);
        
        // Проверяем доступ к премиум-контенту
        if (lesson.isPremium && (!req.user || req.user.role !== 'premium')) {
          res.status(403).json({
            status: 'ERROR',
            message: 'Для доступа к этому уроку требуется премиум-подписка'
          });
          return;
        }
        
        res.status(200).json({
          status: 'OK',
          data: {
            lesson
          }
        });
        return;
      }
      
      // Демо-данные об уроке (в реальном приложении здесь был бы запрос к БД)
      if (lessonId === 1) {
        const lesson = {
          id: 1,
          moduleId: 1,
          title: 'Что такое Wildberries',
          description: 'Обзор маркетплейса и его особенностей',
          fullContent: 'Полное содержание урока с детальным описанием всех тем',
          duration: '20 минут',
          order: 1,
          isPremium: false,
          videoUrl: 'https://example.com/videos/wb-intro.mp4',
          materials: [
            { type: 'pdf', title: 'Конспект урока', url: 'https://example.com/materials/wb-intro.pdf' }
          ]
        };
        
        // Сохраняем в кэш
        await redisClient.set(`${this.CACHE_PREFIX}${lessonId}`, JSON.stringify(lesson), 'EX', 3600);
        
        res.status(200).json({
          status: 'OK',
          data: {
            lesson
          }
        });
      } else if (lessonId === 6) {
        // Проверяем доступ к премиум-контенту
        if (!req.user || req.user.role !== 'premium') {
          res.status(403).json({
            status: 'ERROR',
            message: 'Для доступа к этому уроку требуется премиум-подписка'
          });
          return;
        }
        
        const lesson = {
          id: 6,
          moduleId: 2,
          title: 'Анализ спроса на маркетплейсе',
          description: 'Как определить спрос на товары с помощью аналитических инструментов',
          fullContent: 'Полное содержание урока с детальным описанием всех тем',
          duration: '30 минут',
          order: 1,
          isPremium: true,
          videoUrl: 'https://example.com/videos/wb-demand.mp4',
          materials: [
            { type: 'pdf', title: 'Аналитический отчет', url: 'https://example.com/materials/wb-demand.pdf' }
          ]
        };
        
        // Сохраняем в кэш
        await redisClient.set(`${this.CACHE_PREFIX}${lessonId}`, JSON.stringify(lesson), 'EX', 3600);
        
        res.status(200).json({
          status: 'OK',
          data: {
            lesson
          }
        });
      } else {
        res.status(404).json({
          status: 'ERROR',
          message: 'Урок не найден'
        });
      }
    } catch (error) {
      console.error('Ошибка при получении урока:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при получении урока'
      });
    }
  }
  
  /**
   * Создание нового урока
   */
  async createLesson(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId, title, description, fullContent, duration, order, isPremium, videoUrl, materials } = req.body;
      
      // Проверяем наличие обязательных полей
      if (!moduleId || !title || !description) {
        res.status(400).json({
          status: 'ERROR',
          message: 'ID модуля, название и описание урока обязательны'
        });
        return;
      }
      
      // Проверяем, существует ли модуль
      const moduleExists = await redisClient.exists(`module:${moduleId}`);
      if (!moduleExists) {
        res.status(404).json({
          status: 'ERROR',
          message: 'Указанный модуль не найден'
        });
        return;
      }
      
      // Создаем новый урок
      const newLesson = {
        id: Date.now(), // Генерируем уникальный ID на основе времени
        moduleId,
        title,
        description,
        fullContent: fullContent || '',
        duration: duration || '0 минут',
        order: order || 1,
        isPremium: isPremium || false,
        videoUrl: videoUrl || '',
        materials: materials || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Сохраняем в Redis для демонстрации
      await redisClient.set(`${this.CACHE_PREFIX}${newLesson.id}`, JSON.stringify(newLesson));
      
      res.status(201).json({
        status: 'OK',
        message: 'Урок успешно создан',
        data: {
          lesson: newLesson
        }
      });
    } catch (error) {
      console.error('Ошибка при создании урока:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при создании урока'
      });
    }
  }
  
  /**
   * Обновление урока
   */
  async updateLesson(req: Request, res: Response): Promise<void> {
    try {
      const lessonId = parseInt(req.params.id);
      
      // Проверяем валидность параметра
      if (isNaN(lessonId)) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Неверный формат ID урока'
        });
        return;
      }
      
      // Проверяем существование урока
      const lessonData = await redisClient.get(`${this.CACHE_PREFIX}${lessonId}`);
      if (!lessonData) {
        res.status(404).json({
          status: 'ERROR',
          message: 'Урок не найден'
        });
        return;
      }
      
      const lesson = JSON.parse(lessonData);
      
      // Обновляем данные урока
      const updatedLesson = {
        ...lesson,
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      // Сохраняем обновленный урок
      await redisClient.set(`${this.CACHE_PREFIX}${lessonId}`, JSON.stringify(updatedLesson));
      
      res.status(200).json({
        status: 'OK',
        message: 'Урок успешно обновлен',
        data: {
          lesson: updatedLesson
        }
      });
    } catch (error) {
      console.error('Ошибка при обновлении урока:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при обновлении урока'
      });
    }
  }
  
  /**
   * Удаление урока
   */
  async deleteLesson(req: Request, res: Response): Promise<void> {
    try {
      const lessonId = parseInt(req.params.id);
      
      // Проверяем валидность параметра
      if (isNaN(lessonId)) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Неверный формат ID урока'
        });
        return;
      }
      
      // Проверяем существование урока
      const lessonExists = await redisClient.exists(`${this.CACHE_PREFIX}${lessonId}`);
      if (!lessonExists) {
        res.status(404).json({
          status: 'ERROR',
          message: 'Урок не найден'
        });
        return;
      }
      
      // Удаляем урок
      await redisClient.del(`${this.CACHE_PREFIX}${lessonId}`);
      
      res.status(200).json({
        status: 'OK',
        message: 'Урок успешно удален'
      });
    } catch (error) {
      console.error('Ошибка при удалении урока:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при удалении урока'
      });
    }
  }
} 