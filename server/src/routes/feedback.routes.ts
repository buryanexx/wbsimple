import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();
const feedbackController = new FeedbackController();

/**
 * @route POST /api/feedback
 * @desc Отправка обратной связи
 * @access Private
 */
router.post('/', 
  authMiddleware, 
  feedbackController.submitFeedback.bind(feedbackController)
);

/**
 * @route GET /api/feedback
 * @desc Получение обратной связи (для админов)
 * @access Admin
 */
router.get('/', 
  authMiddleware, 
  adminMiddleware, 
  feedbackController.getFeedbacks.bind(feedbackController)
);

/**
 * @route DELETE /api/feedback/:id
 * @desc Удаление обратной связи (для админов или автора)
 * @access Private
 */
router.delete('/:id', 
  authMiddleware, 
  feedbackController.deleteFeedback.bind(feedbackController)
);

export const feedbackRoutes = router; 