import express from 'express';
import {
  getSubscriptionInfo,
  createSubscription,
  cancelAutoRenewal,
  enableAutoRenewal,
  handlePaymentWebhook
} from '../controllers/subscriptionController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Получение информации о подписке пользователя
router.get('/info', auth, getSubscriptionInfo);

// Создание новой подписки
router.post('/', auth, createSubscription);

// Отмена автопродления подписки
router.post('/cancel-auto-renewal', auth, cancelAutoRenewal);

// Включение автопродления подписки
router.post('/enable-auto-renewal', auth, enableAutoRenewal);

// Обработка webhook от Telegram Payments
router.post('/webhook', handlePaymentWebhook);

export default router; 