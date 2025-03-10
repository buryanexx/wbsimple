import { Request, Response } from 'express';
import { Lesson, Module, UserProgress } from '../models/index.js';

// Контроллер для работы с уроками
const lessonController = {
  // Получение всех уроков
  getAllLessons: async (req: Request, res: Response) => {
    try {
      // Получаем все уроки, сортируем по модулю и порядку
      const lessons = await Lesson.findAll({
        order: [['moduleId', 'ASC'], ['order', 'ASC']],
        include: [
          {
            model: Module,
            as: 'module',
            attributes: ['id', 'title'],
          },
        ],
      });
      
      res.status(200).json(lessons);
    } catch (error) {
      console.error('Ошибка получения уроков:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении уроков' });
    }
  },
  
  // Получение урока по ID
  getLessonById: async (req: Request, res: Response) => {
    try {
      const lessonId = parseInt(req.params.id);
      
      // Проверяем, что ID является числом
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: 'Некорректный ID урока' });
      }
      
      // Находим урок по ID
      const lesson = await Lesson.findByPk(lessonId, {
        include: [
          {
            model: Module,
            as: 'module',
            attributes: ['id', 'title'],
          },
        ],
      });
      
      if (!lesson) {
        return res.status(404).json({ message: 'Урок не найден' });
      }
      
      res.status(200).json(lesson);
    } catch (error) {
      console.error('Ошибка получения урока:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении урока' });
    }
  },
  
  // Получение уроков по ID модуля
  getLessonsByModuleId: async (req: Request, res: Response) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      
      // Проверяем, что ID является числом
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: 'Некорректный ID модуля' });
      }
      
      // Проверяем, существует ли модуль
      const module = await Module.findByPk(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: 'Модуль не найден' });
      }
      
      // Находим уроки по ID модуля
      const lessons = await Lesson.findAll({
        where: { moduleId },
        order: [['order', 'ASC']],
      });
      
      res.status(200).json(lessons);
    } catch (error) {
      console.error('Ошибка получения уроков модуля:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении уроков модуля' });
    }
  },
  
  // Создание нового урока (только для администраторов)
  createLesson: async (req: Request, res: Response) => {
    try {
      // Проверяем, является ли пользователь администратором
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
      
      const { moduleId, title, content, order, videoUrl } = req.body;
      
      // Проверяем обязательные поля
      if (!moduleId || !title || !content || !order) {
        return res.status(400).json({ message: 'Необходимо указать moduleId, title, content и order' });
      }
      
      // Проверяем, существует ли модуль
      const module = await Module.findByPk(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: 'Модуль не найден' });
      }
      
      // Создаем новый урок
      const newLesson = await Lesson.create({
        moduleId,
        title,
        content,
        order,
        videoUrl,
        isPublished: false,
      });
      
      res.status(201).json(newLesson);
    } catch (error) {
      console.error('Ошибка создания урока:', error);
      res.status(500).json({ message: 'Ошибка сервера при создании урока' });
    }
  },
  
  // Обновление урока (только для администраторов)
  updateLesson: async (req: Request, res: Response) => {
    try {
      // Проверяем, является ли пользователь администратором
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
      
      const lessonId = parseInt(req.params.id);
      
      // Проверяем, что ID является числом
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: 'Некорректный ID урока' });
      }
      
      const { moduleId, title, content, order, videoUrl, isPublished } = req.body;
      
      // Находим урок по ID
      const lesson = await Lesson.findByPk(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: 'Урок не найден' });
      }
      
      // Если указан новый moduleId, проверяем, существует ли модуль
      if (moduleId && moduleId !== lesson.moduleId) {
        const module = await Module.findByPk(moduleId);
        
        if (!module) {
          return res.status(404).json({ message: 'Модуль не найден' });
        }
      }
      
      // Обновляем урок
      await lesson.update({
        moduleId: moduleId || lesson.moduleId,
        title: title || lesson.title,
        content: content || lesson.content,
        order: order || lesson.order,
        videoUrl: videoUrl !== undefined ? videoUrl : lesson.videoUrl,
        isPublished: isPublished !== undefined ? isPublished : lesson.isPublished,
      });
      
      res.status(200).json(lesson);
    } catch (error) {
      console.error('Ошибка обновления урока:', error);
      res.status(500).json({ message: 'Ошибка сервера при обновлении урока' });
    }
  },
  
  // Удаление урока (только для администраторов)
  deleteLesson: async (req: Request, res: Response) => {
    try {
      // Проверяем, является ли пользователь администратором
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
      
      const lessonId = parseInt(req.params.id);
      
      // Проверяем, что ID является числом
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: 'Некорректный ID урока' });
      }
      
      // Находим урок по ID
      const lesson = await Lesson.findByPk(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: 'Урок не найден' });
      }
      
      // Удаляем урок
      await lesson.destroy();
      
      res.status(200).json({ message: 'Урок успешно удален' });
    } catch (error) {
      console.error('Ошибка удаления урока:', error);
      res.status(500).json({ message: 'Ошибка сервера при удалении урока' });
    }
  },
  
  // Отметка урока как завершенного
  completeLesson: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const lessonId = parseInt(req.params.id);
      
      // Проверяем, что ID является числом
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: 'Некорректный ID урока' });
      }
      
      // Находим урок по ID
      const lesson = await Lesson.findByPk(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: 'Урок не найден' });
      }
      
      // Проверяем, завершен ли уже урок
      let userProgress = await UserProgress.findOne({
        where: {
          userId,
          lessonId,
        },
      });
      
      if (userProgress) {
        if (userProgress.completed) {
          return res.status(400).json({ message: 'Урок уже завершен' });
        }
        
        // Обновляем прогресс
        await userProgress.update({
          completed: true,
          completedAt: new Date(),
        });
      } else {
        // Создаем новую запись о прогрессе
        userProgress = await UserProgress.create({
          userId,
          lessonId,
          moduleId: lesson.moduleId,
          completed: true,
          completedAt: new Date(),
        });
      }
      
      res.status(200).json({ message: 'Урок успешно завершен', progress: userProgress });
    } catch (error) {
      console.error('Ошибка завершения урока:', error);
      res.status(500).json({ message: 'Ошибка сервера при завершении урока' });
    }
  },
};

export default lessonController; 