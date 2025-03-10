import { Request, Response } from 'express';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import User from '../models/User.js';

// Получение урока по ID
export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { moduleId, lessonId } = req.params;
    
    const lesson = await Lesson.findOne({
      moduleId: parseInt(moduleId),
      lessonId: parseInt(lessonId)
    });
    
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    
    res.status(200).json({ lesson });
  } catch (error) {
    console.error('Ошибка получения урока:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение всех уроков модуля
export const getLessonsByModuleId = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    
    const lessons = await Lesson.find({ moduleId: parseInt(moduleId) }).sort({ order: 1 });
    
    res.status(200).json({ lessons });
  } catch (error) {
    console.error('Ошибка получения уроков модуля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создание нового урока (для админов)
export const createLesson = async (req: Request, res: Response) => {
  try {
    const {
      moduleId,
      title,
      description,
      videoUrl,
      duration,
      order,
      materials,
      quiz
    } = req.body;
    
    // Проверяем, существует ли модуль
    const module = await Module.findOne({ moduleId: parseInt(moduleId) });
    
    if (!module) {
      return res.status(404).json({ message: 'Модуль не найден' });
    }
    
    // Находим максимальный lessonId для этого модуля
    const maxLessonIdDoc = await Lesson.findOne({ moduleId: parseInt(moduleId) }).sort({ lessonId: -1 });
    const nextLessonId = maxLessonIdDoc ? maxLessonIdDoc.lessonId + 1 : 1;
    
    const newLesson = new Lesson({
      moduleId: parseInt(moduleId),
      lessonId: nextLessonId,
      title,
      description,
      videoUrl,
      duration,
      order,
      materials,
      quiz
    });
    
    await newLesson.save();
    
    // Обновляем количество уроков в модуле
    module.lessonsCount = await Lesson.countDocuments({ moduleId: parseInt(moduleId) });
    await module.save();
    
    res.status(201).json({ lesson: newLesson });
  } catch (error) {
    console.error('Ошибка создания урока:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновление урока (для админов)
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { moduleId, lessonId } = req.params;
    const {
      title,
      description,
      videoUrl,
      duration,
      order,
      materials,
      quiz
    } = req.body;
    
    const lesson = await Lesson.findOne({
      moduleId: parseInt(moduleId),
      lessonId: parseInt(lessonId)
    });
    
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    
    lesson.title = title || lesson.title;
    lesson.description = description || lesson.description;
    lesson.videoUrl = videoUrl || lesson.videoUrl;
    lesson.duration = duration || lesson.duration;
    lesson.order = order || lesson.order;
    lesson.materials = materials || lesson.materials;
    lesson.quiz = quiz || lesson.quiz;
    
    await lesson.save();
    
    res.status(200).json({ lesson });
  } catch (error) {
    console.error('Ошибка обновления урока:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удаление урока (для админов)
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { moduleId, lessonId } = req.params;
    
    const lesson = await Lesson.findOne({
      moduleId: parseInt(moduleId),
      lessonId: parseInt(lessonId)
    });
    
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    
    await lesson.deleteOne();
    
    // Обновляем количество уроков в модуле
    const module = await Module.findOne({ moduleId: parseInt(moduleId) });
    if (module) {
      module.lessonsCount = await Lesson.countDocuments({ moduleId: parseInt(moduleId) });
      await module.save();
    }
    
    res.status(200).json({ message: 'Урок успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления урока:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Отметка урока как завершенного
export const completeLesson = async (req: Request, res: Response) => {
  try {
    const { moduleId, lessonId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Проверяем, существует ли урок
    const lesson = await Lesson.findOne({
      moduleId: parseInt(moduleId),
      lessonId: parseInt(lessonId)
    });
    
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    
    // Создаем уникальный идентификатор урока (moduleId_lessonId)
    const lessonUniqueId = parseInt(`${moduleId}${lessonId.toString().padStart(2, '0')}`);
    
    // Проверяем, не завершен ли уже урок
    if (user.progress.completedLessons.includes(lessonUniqueId)) {
      return res.status(400).json({ message: 'Урок уже завершен' });
    }
    
    // Добавляем урок в список завершенных
    user.progress.completedLessons.push(lessonUniqueId);
    
    // Проверяем, завершены ли все уроки модуля
    const moduleAllLessons = await Lesson.find({ moduleId: parseInt(moduleId) });
    const moduleLessonIds = moduleAllLessons.map(l => parseInt(`${moduleId}${l.lessonId.toString().padStart(2, '0')}`));
    
    const allLessonsCompleted = moduleLessonIds.every(id => user.progress.completedLessons.includes(id));
    
    // Если все уроки завершены, отмечаем модуль как завершенный
    if (allLessonsCompleted && !user.progress.completedModules.includes(parseInt(moduleId))) {
      user.progress.completedModules.push(parseInt(moduleId));
    }
    
    await user.save();
    
    res.status(200).json({ message: 'Урок отмечен как завершенный', progress: user.progress });
  } catch (error) {
    console.error('Ошибка отметки урока как завершенного:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}; 