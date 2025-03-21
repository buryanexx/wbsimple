import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();
const lessonController = new LessonController();

/**
 * @route GET /api/lessons/module/:moduleId
 * @desc Получение уроков модуля
 * @access Public
 */
router.get('/module/:moduleId', lessonController.getLessonsByModule.bind(lessonController));

/**
 * @route GET /api/lessons/:id
 * @desc Получение урока по ID
 * @access Public
 */
router.get('/:id', lessonController.getLessonById.bind(lessonController));

/**
 * @route POST /api/lessons
 * @desc Создание нового урока
 * @access Admin
 */
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  lessonController.createLesson.bind(lessonController)
);

/**
 * @route PUT /api/lessons/:id
 * @desc Обновление урока
 * @access Admin
 */
router.put('/:id', 
  authMiddleware, 
  adminMiddleware, 
  lessonController.updateLesson.bind(lessonController)
);

/**
 * @route DELETE /api/lessons/:id
 * @desc Удаление урока
 * @access Admin
 */
router.delete('/:id', 
  authMiddleware, 
  adminMiddleware, 
  lessonController.deleteLesson.bind(lessonController)
);

export const lessonRoutes = router; 