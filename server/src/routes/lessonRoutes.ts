import express from 'express';
import {
  getLessonById,
  getLessonsByModuleId,
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson
} from '../controllers/lessonController.js';
import { auth, checkSubscription } from '../middleware/auth.js';

const router = express.Router();

// Получение всех уроков модуля
router.get('/module/:moduleId', auth, getLessonsByModuleId);

// Получение урока по ID
router.get('/:moduleId/:lessonId', auth, getLessonById);

// Создание нового урока (для админов)
router.post('/', auth, createLesson);

// Обновление урока (для админов)
router.put('/:moduleId/:lessonId', auth, updateLesson);

// Удаление урока (для админов)
router.delete('/:moduleId/:lessonId', auth, deleteLesson);

// Отметка урока как завершенного
router.post('/:moduleId/:lessonId/complete', auth, completeLesson);

export default router; 