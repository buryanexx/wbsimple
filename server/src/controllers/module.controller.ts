import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import config from '../config';
import { redis } from '../utils/redis.factory';

const prisma = new PrismaClient();
const redisClient = new Redis(config.redis.url);

/**
 * Контроллер для управления образовательными модулями
 */
export class ModuleController {
  private readonly CACHE_PREFIX = 'module:';
  
  /**
   * Получение списка всех модулей
   */
  async getAllModules(req: Request, res: Response) {
    try {
      const { includeLessons } = req.query;
      const isAdmin = (req as any).user?.role === 'ADMIN';
      
      // Проверяем кэш для неадминов
      if (!isAdmin) {
        const cacheKey = 'modules:list';
        const cachedModules = await redisClient.get(cacheKey);
        
        if (cachedModules) {
          return res.status(200).json(JSON.parse(cachedModules));
        }
      }
      
      // Формируем параметры запроса
      const queryParams: any = {
        where: {
          // Для обычных пользователей показываем только опубликованные модули
          ...(isAdmin ? {} : { isPublished: true })
        },
        orderBy: { order: 'asc' },
        include: {
          lessons: includeLessons === 'true' ? {
            where: isAdmin ? {} : { isPublished: true },
            select: {
              id: true,
              title: true,
              description: true,
              order: true,
              type: true,
              duration: true,
              isPublished: true
            },
            orderBy: { order: 'asc' }
          } : false
        }
      };
      
      // Получаем модули из базы данных
      const modules = await prisma.module.findMany(queryParams);
      
      // Кэшируем результат для неадминов
      if (!isAdmin) {
        await redisClient.set(
          'modules:list', 
          JSON.stringify(modules),
          'EX',
          3600 // 1 час
        );
      }
      
      return res.status(200).json(modules);
    } catch (error) {
      logger.error('Error getting all modules', { error });
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
  
  /**
   * Получение модуля по ID
   */
  async getModuleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { includeLessons } = req.query;
      const isAdmin = (req as any).user?.role === 'ADMIN';
      
      // Проверяем кэш для неадминов
      if (!isAdmin) {
        const cacheKey = `module:${id}`;
        const cachedModule = await redisClient.get(cacheKey);
        
        if (cachedModule) {
          return res.status(200).json(JSON.parse(cachedModule));
        }
      }
      
      // Получаем модуль из базы данных
      const module = await prisma.module.findUnique({
        where: { id },
        include: {
          lessons: includeLessons === 'true' ? {
            where: isAdmin ? {} : { isPublished: true },
            select: {
              id: true,
              title: true,
              description: true,
              order: true,
              type: true,
              duration: true,
              isPublished: true
            },
            orderBy: { order: 'asc' }
          } : false
        }
      });
      
      if (!module) {
        return res.status(404).json({ error: 'Модуль не найден' });
      }
      
      // Если модуль не опубликован и пользователь не админ, возвращаем 404
      if (!module.isPublished && !isAdmin) {
        return res.status(404).json({ error: 'Модуль не найден' });
      }
      
      // Кэшируем результат для неадминов
      if (!isAdmin && module.isPublished) {
        await redisClient.set(
          `module:${id}`,
          JSON.stringify(module),
          'EX',
          3600 // 1 час
        );
      }
      
      return res.status(200).json(module);
    } catch (error) {
      logger.error('Error getting module by id', { error, moduleId: req.params.id });
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
  
  /**
   * Создание нового модуля
   */
  async createModule(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, fullDescription, lessonsCount, duration, isPremium } = req.body;
      
      // Проверяем наличие обязательных полей
      if (!title || !description) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Название и описание модуля обязательны'
        });
        return;
      }
      
      // В реальном приложении здесь был бы запрос к базе данных
      // Для демонстрации используем имитацию создания модуля
      const newModule = {
        id: Date.now(), // Генерируем уникальный ID на основе времени
        title,
        description,
        fullDescription: fullDescription || '',
        lessonsCount: lessonsCount || 0,
        duration: duration || '0 часов',
        isAvailable: true,
        isPremium: isPremium || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Сохраняем в Redis для демонстрации
      await redis.set(`${this.CACHE_PREFIX}${newModule.id}`, JSON.stringify(newModule));
      
      res.status(201).json({
        status: 'OK',
        message: 'Модуль успешно создан',
        data: {
          module: newModule
        }
      });
    } catch (error) {
      console.error('Ошибка при создании модуля:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при создании модуля'
      });
    }
  }
  
  /**
   * Обновление модуля
   */
  async updateModule(req: Request, res: Response): Promise<void> {
    try {
      const moduleId = parseInt(req.params.id);
      
      // Проверяем валидность параметра
      if (isNaN(moduleId)) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Неверный формат ID модуля'
        });
        return;
      }
      
      // Проверяем существование модуля
      const moduleData = await redis.get(`${this.CACHE_PREFIX}${moduleId}`);
      if (!moduleData) {
        res.status(404).json({
          status: 'ERROR',
          message: 'Модуль не найден'
        });
        return;
      }
      
      const module = JSON.parse(moduleData);
      
      // Обновляем данные модуля
      const updatedModule = {
        ...module,
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      // Сохраняем обновленный модуль
      await redis.set(`${this.CACHE_PREFIX}${moduleId}`, JSON.stringify(updatedModule));
      
      res.status(200).json({
        status: 'OK',
        message: 'Модуль успешно обновлен',
        data: {
          module: updatedModule
        }
      });
    } catch (error) {
      console.error('Ошибка при обновлении модуля:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при обновлении модуля'
      });
    }
  }
  
  /**
   * Удаление модуля
   */
  async deleteModule(req: Request, res: Response): Promise<void> {
    try {
      const moduleId = parseInt(req.params.id);
      
      // Проверяем валидность параметра
      if (isNaN(moduleId)) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Неверный формат ID модуля'
        });
        return;
      }
      
      // Проверяем существование модуля
      const moduleExists = await redis.exists(`${this.CACHE_PREFIX}${moduleId}`);
      if (!moduleExists) {
        res.status(404).json({
          status: 'ERROR',
          message: 'Модуль не найден'
        });
        return;
      }
      
      // Удаляем модуль
      await redis.del(`${this.CACHE_PREFIX}${moduleId}`);
      
      res.status(200).json({
        status: 'OK',
        message: 'Модуль успешно удален'
      });
    } catch (error) {
      console.error('Ошибка при удалении модуля:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Ошибка при удалении модуля'
      });
    }
  }
} 