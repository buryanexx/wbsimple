import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import videoController from '../controllers/videoController.js';

const router = express.Router();

/**
 * @route GET /api/videos/secure-url/:videoId
 * @desc Получить защищенный URL для доступа к видео
 * @access Private
 */
router.get('/secure-url/:videoId', authenticateToken, videoController.getSecureVideoUrl);

/**
 * @route POST /api/videos/mark-watched/:videoId
 * @desc Отметить видео как просмотренное с указанием прогресса
 * @access Private
 */
router.post('/mark-watched/:videoId', authenticateToken, videoController.markVideoAsWatched);

/**
 * @route GET /api/videos/progress/:videoId
 * @desc Получить прогресс просмотра видео
 * @access Private
 */
router.get('/progress/:videoId', authenticateToken, videoController.getVideoProgress);

export default router; 