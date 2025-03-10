import { Request, Response } from 'express';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';

// Получение всех модулей
export const getAllModules = async (req: Request, res: Response) => {
  try {
    const modules = await Module.find().sort({ order: 1 });
    
    res.status(200).json({ modules });
  } catch (error) {
    console.error('Ошибка получения модулей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение модуля по ID
export const getModuleById = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    
    const module = await Module.findOne({ moduleId: parseInt(moduleId) });
    
    if (!module) {
      return res.status(404).json({ message: 'Модуль не найден' });
    }
    
    // Получаем уроки для этого модуля
    const lessons = await Lesson.find({ moduleId: parseInt(moduleId) }).sort({ order: 1 });
    
    res.status(200).json({ module, lessons });
  } catch (error) {
    console.error('Ошибка получения модуля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создание нового модуля (для админов)
export const createModule = async (req: Request, res: Response) => {
  try {
    const { title, description, icon, order, isPremium, lessonsCount } = req.body;
    
    // Находим максимальный moduleId
    const maxModuleIdDoc = await Module.findOne().sort({ moduleId: -1 });
    const nextModuleId = maxModuleIdDoc ? maxModuleIdDoc.moduleId + 1 : 1;
    
    const newModule = new Module({
      moduleId: nextModuleId,
      title,
      description,
      icon,
      order,
      isPremium,
      lessonsCount
    });
    
    await newModule.save();
    
    res.status(201).json({ module: newModule });
  } catch (error) {
    console.error('Ошибка создания модуля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновление модуля (для админов)
export const updateModule = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const { title, description, icon, order, isPremium, lessonsCount } = req.body;
    
    const module = await Module.findOne({ moduleId: parseInt(moduleId) });
    
    if (!module) {
      return res.status(404).json({ message: 'Модуль не найден' });
    }
    
    module.title = title || module.title;
    module.description = description || module.description;
    module.icon = icon || module.icon;
    module.order = order || module.order;
    module.isPremium = isPremium !== undefined ? isPremium : module.isPremium;
    module.lessonsCount = lessonsCount || module.lessonsCount;
    
    await module.save();
    
    res.status(200).json({ module });
  } catch (error) {
    console.error('Ошибка обновления модуля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удаление модуля (для админов)
export const deleteModule = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    
    const module = await Module.findOne({ moduleId: parseInt(moduleId) });
    
    if (!module) {
      return res.status(404).json({ message: 'Модуль не найден' });
    }
    
    // Удаляем все уроки этого модуля
    await Lesson.deleteMany({ moduleId: parseInt(moduleId) });
    
    // Удаляем модуль
    await module.deleteOne();
    
    res.status(200).json({ message: 'Модуль успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления модуля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Отметка модуля как завершенного
export const completeModule = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Проверяем, существует ли модуль
    const module = await Module.findOne({ moduleId: parseInt(moduleId) });
    
    if (!module) {
      return res.status(404).json({ message: 'Модуль не найден' });
    }
    
    // Проверяем, не завершен ли уже модуль
    if (user.progress.completedModules.includes(parseInt(moduleId))) {
      return res.status(400).json({ message: 'Модуль уже завершен' });
    }
    
    // Добавляем модуль в список завершенных
    user.progress.completedModules.push(parseInt(moduleId));
    await user.save();
    
    res.status(200).json({ message: 'Модуль отмечен как завершенный', progress: user.progress });
  } catch (error) {
    console.error('Ошибка отметки модуля как завершенного:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}; 