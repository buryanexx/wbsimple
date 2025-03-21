import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { moduleRoutes } from './module.routes';
import { lessonRoutes } from './lesson.routes';
import { progressRoutes } from './progress.routes';
import videoRoutes from './videoRoutes';

// Создаем корневой роутер
const router = Router();

// Маршруты для авторизации
router.use('/auth', authRoutes);

// Маршруты для модулей
router.use('/modules', moduleRoutes);

// Маршруты для уроков
router.use('/lessons', lessonRoutes);

// Маршруты для прогресса
router.use('/progress', progressRoutes);

// Маршруты для видео
router.use('/videos', videoRoutes);

// Экспортируем все API маршруты
export const apiRoutes = router;