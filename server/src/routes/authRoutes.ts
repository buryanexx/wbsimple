import express from 'express';
import { telegramAuth, getCurrentUser } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Аутентификация пользователя Telegram
router.post('/telegram', telegramAuth);

// Получение данных текущего пользователя
router.get('/me', auth, getCurrentUser);

export default router; 