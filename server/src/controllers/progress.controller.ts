import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { redis } from '../utils/redis.factory';

const prisma = new PrismaClient();

/**
 * Контроллер для управления прогрессом пользователей в обучении
 */
export class ProgressController {
  private readonly CACHE_PREFIX = 'progress:';
  
  /**
   * Получение прогресса пользователя по модулю
   */
  async getModuleProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const moduleId = parseInt(req.params.moduleId);
      
      // Проверяем авторизацию
      if (!userId) {
        res.status(401).json({
          status: 'ERROR',
          message: 'Требуется авторизация'
        });
        return;
      }
      
      // Проверяем валидность параметра
      if (isNaN(moduleId)) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Неверный формат ID модуля'
        });
        return;
      }
      
      // Получаем прогресс из кэша
      const progressKey = `${this.CACHE_PREFIX}${userId}:module:${moduleId}`;
      const progressData = await redis.get(progressKey);
      
      if (progressData) {
        res.status(200).json({
          status: 'OK',
          data: {
            progress: JSON.parse(progressData)
          }
        });
      } else {
        // Если прогресс не найден, возвращаем пустой прогресс
        res.status(200).json({
          status: 'OK',
          data: {
            progress: {
              userId,
              moduleId,
              completedLessons: [],
              startedAt: null,
              lastAccessedAt: new Date().toISOString(),
              completedAt: null,
              progress: 0
            }
          }
        });
      }
    } catch (error) {
      console.error('Ошибка при получении прогресса модуля:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при получении прогресса модуля'
      });
    }
  }
  
  /**
   * Получение прогресса пользователя по уроку
   */
  async getLessonProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const lessonId = parseInt(req.params.lessonId);
      
      // Проверяем авторизацию
      if (!userId) {
        res.status(401).json({
          status: 'ERROR',
          message: 'Требуется авторизация'
        });
        return;
      }
      
      // Проверяем валидность параметра
      if (isNaN(lessonId)) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Неверный формат ID урока'
        });
        return;
      }
      
      // Получаем прогресс из кэша
      const progressKey = `${this.CACHE_PREFIX}${userId}:lesson:${lessonId}`;
      const progressData = await redis.get(progressKey);
      
      if (progressData) {
        res.status(200).json({
          status: 'OK',
          data: {
            progress: JSON.parse(progressData)
          }
        });
      } else {
        // Если прогресс не найден, возвращаем пустой прогресс
        res.status(200).json({
          status: 'OK',
          data: {
            progress: {
              userId,
              lessonId,
              status: 'not_started', // not_started, in_progress, completed
              startedAt: null,
              lastAccessedAt: new Date().toISOString(),
              completedAt: null,
              watchTime: 0,
              position: 0
            }
          }
        });
      }
    } catch (error) {
      console.error('Ошибка при получении прогресса урока:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при получении прогресса урока'
      });
    }
  }
  
  /**
   * Обновление прогресса пользователя по уроку
   */
  async updateLessonProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const lessonId = parseInt(req.params.lessonId);
      const { status, position, watchTime } = req.body;
      
      // Проверяем авторизацию
      if (!userId) {
        res.status(401).json({
          status: 'ERROR',
          message: 'Требуется авторизация'
        });
        return;
      }
      
      // Проверяем валидность параметра
      if (isNaN(lessonId)) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Неверный формат ID урока'
        });
        return;
      }
      
      // Получаем текущий прогресс
      const progressKey = `${this.CACHE_PREFIX}${userId}:lesson:${lessonId}`;
      const currentProgressData = await redis.get(progressKey);
      
      // Определяем начальное значение прогресса
      let progress = currentProgressData 
        ? JSON.parse(currentProgressData) 
        : {
            userId,
            lessonId,
            status: 'not_started',
            startedAt: null,
            lastAccessedAt: new Date().toISOString(),
            completedAt: null,
            watchTime: 0,
            position: 0
          };
      
      // Обновляем прогресс
      const now = new Date().toISOString();
      
      // Если статус меняется на in_progress и ранее не был начат
      if (status === 'in_progress' && progress.status === 'not_started') {
        progress.startedAt = now;
      }
      
      // Если статус меняется на completed и ранее не был завершен
      if (status === 'completed' && progress.status !== 'completed') {
        progress.completedAt = now;
        
        // Обновляем также прогресс модуля
        await this.updateModuleProgressOnLessonCompletion(userId, lessonId);
      }
      
      // Обновляем остальные поля
      progress = {
        ...progress,
        status: status || progress.status,
        position: position !== undefined ? position : progress.position,
        watchTime: watchTime !== undefined ? watchTime : progress.watchTime,
        lastAccessedAt: now
      };
      
      // Сохраняем обновленный прогресс
      await redis.set(progressKey, JSON.stringify(progress), 'EX', 60 * 60 * 24 * 30); // 30 дней
      
      res.status(200).json({
        status: 'OK',
        message: 'Прогресс успешно обновлен',
        data: {
          progress
        }
      });
    } catch (error) {
      console.error('Ошибка при обновлении прогресса урока:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при обновлении прогресса урока'
      });
    }
  }
  
  /**
   * Вспомогательный метод для обновления прогресса модуля при завершении урока
   */
  private async updateModuleProgressOnLessonCompletion(userId: number, lessonId: number): Promise<void> {
    try {
      // Получаем информацию об уроке, чтобы узнать ID модуля
      const lessonKey = `lesson:${lessonId}`;
      const lessonData = await redis.get(lessonKey);
      
      if (!lessonData) {
        return; // Если урок не найден, ничего не делаем
      }
      
      const lesson = JSON.parse(lessonData);
      const moduleId = lesson.moduleId;
      
      // Получаем текущий прогресс модуля
      const moduleProgressKey = `${this.CACHE_PREFIX}${userId}:module:${moduleId}`;
      const moduleProgressData = await redis.get(moduleProgressKey);
      
      let moduleProgress = moduleProgressData 
        ? JSON.parse(moduleProgressData) 
        : {
            userId,
            moduleId,
            completedLessons: [],
            startedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            completedAt: null,
            progress: 0
          };
      
      // Добавляем урок в список завершенных, если его там еще нет
      if (!moduleProgress.completedLessons.includes(lessonId)) {
        moduleProgress.completedLessons.push(lessonId);
      }
      
      // Получаем информацию о модуле для расчета прогресса
      const moduleKey = `module:${moduleId}`;
      const moduleData = await redis.get(moduleKey);
      
      if (moduleData) {
        const module = JSON.parse(moduleData);
        // Рассчитываем процент завершения
        if (module.lessonsCount > 0) {
          moduleProgress.progress = Math.round((moduleProgress.completedLessons.length / module.lessonsCount) * 100);
          
          // Если все уроки завершены
          if (moduleProgress.progress === 100) {
            moduleProgress.completedAt = new Date().toISOString();
          }
        }
      }
      
      // Обновляем время последнего доступа
      moduleProgress.lastAccessedAt = new Date().toISOString();
      
      // Сохраняем обновленный прогресс модуля
      await redis.set(moduleProgressKey, JSON.stringify(moduleProgress), 'EX', 60 * 60 * 24 * 30); // 30 дней
    } catch (error) {
      console.error('Ошибка при обновлении прогресса модуля:', error);
    }
  }
  
  /**
   * Получение общего прогресса пользователя
   */
  async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      // Проверяем авторизацию
      if (!userId) {
        res.status(401).json({
          status: 'ERROR',
          message: 'Требуется авторизация'
        });
        return;
      }
      
      // Получаем прогресс пользователя по всем модулям
      // В реальном приложении здесь был бы запрос к базе данных
      // Для демонстрации возвращаем пример данных
      
      res.status(200).json({
        status: 'OK',
        data: {
          progress: {
            userId,
            moduleStats: {
              total: 3,
              started: 2,
              completed: 1
            },
            lessonStats: {
              total: 19,
              started: 8,
              completed: 5
            },
            modules: [
              {
                moduleId: 1,
                title: 'Введение в Wildberries',
                progress: 80,
                completedLessons: 4,
                totalLessons: 5
              },
              {
                moduleId: 2,
                title: 'Поиск товаров для продажи',
                progress: 12,
                completedLessons: 1,
                totalLessons: 8
              }
            ]
          }
        }
      });
    } catch (error) {
      console.error('Ошибка при получении прогресса пользователя:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при получении прогресса пользователя'
      });
    }
  }
} 