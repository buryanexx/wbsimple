import { Request, Response } from 'express';
import { Module, Lesson, UserProgress } from '../models/index.js';

// Контроллер для работы с модулями
const moduleController = {
  // Получение всех модулей
  getAllModules: async (req: Request, res: Response) => {
    try {
      // Получаем все модули, сортируем по порядку
      const modules = await Module.findAll({
        order: [['order', 'ASC']],
        include: [
          {
            model: Lesson,
            as: 'lessons',
            attributes: ['id', 'title', 'order'],
            order: [['order', 'ASC']],
          },
        ],
      });
      
      res.status(200).json(modules);
    } catch (error) {
      console.error('Ошибка получения модулей:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении модулей' });
    }
  },
  
  // Получение модуля по ID
  getModuleById: async (req: Request, res: Response) => {
    try {
      const moduleId = parseInt(req.params.id);
      
      // Проверяем, что ID является числом
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: 'Некорректный ID модуля' });
      }
      
      // Находим модуль по ID
      const module = await Module.findByPk(moduleId, {
        include: [
          {
            model: Lesson,
            as: 'lessons',
            order: [['order', 'ASC']],
          },
        ],
      });
      
      if (!module) {
        return res.status(404).json({ message: 'Модуль не найден' });
      }
      
      res.status(200).json(module);
    } catch (error) {
      console.error('Ошибка получения модуля:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении модуля' });
    }
  },
  
  // Создание нового модуля (только для администраторов)
  createModule: async (req: Request, res: Response) => {
    try {
      // Проверяем, является ли пользователь администратором
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
      
      const { title, description, order, imageUrl } = req.body;
      
      // Проверяем обязательные поля
      if (!title || !description || !order) {
        return res.status(400).json({ message: 'Необходимо указать title, description и order' });
      }
      
      // Создаем новый модуль
      const newModule = await Module.create({
        title,
        description,
        order,
        imageUrl,
        isPublished: false,
      });
      
      res.status(201).json(newModule);
    } catch (error) {
      console.error('Ошибка создания модуля:', error);
      res.status(500).json({ message: 'Ошибка сервера при создании модуля' });
    }
  },
  
  // Обновление модуля (только для администраторов)
  updateModule: async (req: Request, res: Response) => {
    try {
      // Проверяем, является ли пользователь администратором
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
      
      const moduleId = parseInt(req.params.id);
      
      // Проверяем, что ID является числом
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: 'Некорректный ID модуля' });
      }
      
      const { title, description, order, imageUrl, isPublished } = req.body;
      
      // Находим модуль по ID
      const module = await Module.findByPk(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: 'Модуль не найден' });
      }
      
      // Обновляем модуль
      await module.update({
        title: title || module.title,
        description: description || module.description,
        order: order || module.order,
        imageUrl: imageUrl !== undefined ? imageUrl : module.imageUrl,
        isPublished: isPublished !== undefined ? isPublished : module.isPublished,
      });
      
      res.status(200).json(module);
    } catch (error) {
      console.error('Ошибка обновления модуля:', error);
      res.status(500).json({ message: 'Ошибка сервера при обновлении модуля' });
    }
  },
  
  // Удаление модуля (только для администраторов)
  deleteModule: async (req: Request, res: Response) => {
    try {
      // Проверяем, является ли пользователь администратором
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
      
      const moduleId = parseInt(req.params.id);
      
      // Проверяем, что ID является числом
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: 'Некорректный ID модуля' });
      }
      
      // Находим модуль по ID
      const module = await Module.findByPk(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: 'Модуль не найден' });
      }
      
      // Удаляем модуль
      await module.destroy();
      
      res.status(200).json({ message: 'Модуль успешно удален' });
    } catch (error) {
      console.error('Ошибка удаления модуля:', error);
      res.status(500).json({ message: 'Ошибка сервера при удалении модуля' });
    }
  },
  
  // Отметка модуля как завершенного
  completeModule: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const moduleId = parseInt(req.params.id);
      
      // Проверяем, что ID является числом
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: 'Некорректный ID модуля' });
      }
      
      // Находим модуль по ID
      const module = await Module.findByPk(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: 'Модуль не найден' });
      }
      
      // Находим все уроки модуля
      const lessons = await Lesson.findAll({
        where: { moduleId },
      });
      
      if (lessons.length === 0) {
        return res.status(400).json({ message: 'Модуль не содержит уроков' });
      }
      
      // Проверяем, завершены ли все уроки модуля
      const completedLessons = await UserProgress.findAll({
        where: {
          userId,
          moduleId,
          completed: true,
        },
      });
      
      if (completedLessons.length !== lessons.length) {
        return res.status(400).json({ message: 'Необходимо завершить все уроки модуля' });
      }
      
      res.status(200).json({ message: 'Модуль успешно завершен' });
    } catch (error) {
      console.error('Ошибка завершения модуля:', error);
      res.status(500).json({ message: 'Ошибка сервера при завершении модуля' });
    }
  },
};

export default moduleController; 