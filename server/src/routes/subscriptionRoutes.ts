import express from 'express';
import subscriptionController from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Получение информации о подписке текущего пользователя
router.get('/info', authenticateToken, subscriptionController.getSubscriptionInfo);

// Создание новой подписки
router.post('/create', authenticateToken, subscriptionController.createSubscription);

// Отмена автопродления подписки
router.post('/cancel-auto-renewal', authenticateToken, subscriptionController.cancelAutoRenewal);

// Включение автопродления подписки
router.post('/enable-auto-renewal', authenticateToken, subscriptionController.enableAutoRenewal);

// Обработка вебхука платежа
router.post('/payment-webhook', subscriptionController.handlePaymentWebhook);

export default router; 