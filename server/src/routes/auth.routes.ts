import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/auth/register
 * @desc Регистрация нового пользователя
 * @access Публичный
 */
router.post('/register', authController.register.bind(authController));

/**
 * @route POST /api/auth/login
 * @desc Авторизация пользователя
 * @access Публичный
 */
router.post('/login', authController.login.bind(authController));

/**
 * @route POST /api/auth/logout
 * @desc Выход пользователя из системы
 * @access Авторизованные пользователи
 */
router.post('/logout', authMiddleware, authController.logout.bind(authController));

/**
 * @route GET /api/auth/me
 * @desc Получение информации о текущем пользователе
 * @access Авторизованные пользователи
 */
router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));

/**
 * @route PUT /api/auth/me
 * @desc Обновление информации о пользователе
 * @access Авторизованные пользователи
 */
router.put('/me', authMiddleware, authController.updateUser.bind(authController));

/**
 * @route POST /api/auth/premium
 * @desc Повышение прав пользователя до Premium
 * @access Авторизованные пользователи
 */
router.post('/premium', authMiddleware, authController.upgradeToPremium.bind(authController));

/**
 * @route POST /api/auth/telegram
 * @desc Авторизация через Telegram
 * @access Публичный
 */
router.post('/telegram', authController.telegramAuth.bind(authController));

/**
 * @route POST /api/auth/refresh
 * @desc Обновление токенов с помощью refresh токена
 * @access Публичный
 */
router.post('/refresh', authController.refreshToken.bind(authController));

export const authRoutes = router;