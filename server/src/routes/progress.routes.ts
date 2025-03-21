import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();
const progressController = new ProgressController();

/**
 * @route GET /api/progress/user
 * @desc Получение общего прогресса пользователя
 * @access Авторизованные пользователи
 */
router.get('/user', authMiddleware, progressController.getUserProgress.bind(progressController));

/**
 * @route GET /api/progress/modules/:moduleId
 * @desc Получение прогресса пользователя по конкретному модулю
 * @access Авторизованные пользователи
 */
router.get('/modules/:moduleId', authMiddleware, progressController.getModuleProgress.bind(progressController));

/**
 * @route GET /api/progress/lessons/:lessonId
 * @desc Получение прогресса пользователя по конкретному уроку
 * @access Авторизованные пользователи
 */
router.get('/lessons/:lessonId', authMiddleware, progressController.getLessonProgress.bind(progressController));

/**
 * @route PUT /api/progress/lessons/:lessonId
 * @desc Обновление прогресса пользователя по конкретному уроку
 * @access Авторизованные пользователи
 */
router.put('/lessons/:lessonId', authMiddleware, progressController.updateLessonProgress.bind(progressController));

/**
 * @route GET /api/progress/stats
 * @desc Получение статистики прогресса всех пользователей (для админов)
 * @access Admin
 */
router.get('/stats', 
  authMiddleware, 
  adminMiddleware, 
  progressController.getUsersProgressStats.bind(progressController)
);

export const progressRoutes = router; 