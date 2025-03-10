import express from 'express';
import lessonController from '../controllers/lessonController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Получение всех уроков
router.get('/', lessonController.getAllLessons);

// Получение урока по ID
router.get('/:id', lessonController.getLessonById);

// Получение уроков по ID модуля
router.get('/module/:moduleId', lessonController.getLessonsByModuleId);

// Создание нового урока (только для администраторов)
router.post('/', authenticateToken, lessonController.createLesson);

// Обновление урока (только для администраторов)
router.put('/:id', authenticateToken, lessonController.updateLesson);

// Удаление урока (только для администраторов)
router.delete('/:id', authenticateToken, lessonController.deleteLesson);

// Отметка урока как завершенного
router.post('/:id/complete', authenticateToken, lessonController.completeLesson);

export default router; 