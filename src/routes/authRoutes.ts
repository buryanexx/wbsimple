import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Маршрут для аутентификации через Telegram
router.post('/telegram', authController.telegramAuth);

// Маршрут для получения данных текущего пользователя
router.get('/me', authenticateToken, authController.getCurrentUser);

// Маршрут для обновления прогресса пользователя
router.post('/progress', authenticateToken, authController.updateProgress);

export default router; 