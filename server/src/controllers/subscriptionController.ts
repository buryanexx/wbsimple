import { Request, Response } from 'express';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import paymentService from '../services/paymentService.js';
import telegramService from '../services/telegramService.js';

dotenv.config();

// Получение информации о подписке пользователя
export const getSubscriptionInfo = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Проверяем актуальность статуса подписки
    const isSubscriptionActive = await paymentService.checkSubscriptionStatus(user.telegramId);
    
    // Если статус подписки изменился, обновляем пользователя
    if (user.isSubscribed !== isSubscriptionActive) {
      user.isSubscribed = isSubscriptionActive;
      await user.save();
    }
    
    // Получаем последнюю активную подписку пользователя
    const subscription = await Subscription.findOne({
      userId: user._id,
      status: 'active'
    }).sort({ createdAt: -1 });
    
    const subscriptionInfo = {
      isSubscribed: user.isSubscribed,
      subscriptionExpiry: user.subscriptionExpiry,
      autoRenew: subscription ? subscription.autoRenew : false,
      subscriptionDetails: subscription || null
    };
    
    res.status(200).json({ subscription: subscriptionInfo });
  } catch (error) {
    console.error('Ошибка получения информации о подписке:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создание новой подписки
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Проверяем, нет ли уже активной подписки
    if (user.isSubscribed && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()) {
      return res.status(400).json({ message: 'У вас уже есть активная подписка' });
    }
    
    try {
      // Создаем инвойс для оплаты через Telegram
      const paymentId = await paymentService.createInvoice(user.telegramId);
      
      res.status(200).json({ 
        message: 'Инвойс для оплаты создан',
        paymentId
      });
    } catch (error) {
      console.error('Ошибка создания инвойса:', error);
      res.status(500).json({ message: 'Ошибка создания инвойса' });
    }
  } catch (error) {
    console.error('Ошибка создания подписки:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Отмена автопродления подписки
export const cancelAutoRenewal = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Отключаем автопродление
    const success = await paymentService.cancelAutoRenewal(user.telegramId);
    
    if (!success) {
      return res.status(404).json({ message: 'Активная подписка не найдена' });
    }
    
    res.status(200).json({
      message: 'Автопродление подписки отключено',
      subscription: {
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
        autoRenew: false
      }
    });
  } catch (error) {
    console.error('Ошибка отмены автопродления подписки:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Включение автопродления подписки
export const enableAutoRenewal = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Включаем автопродление
    const success = await paymentService.enableAutoRenewal(user.telegramId);
    
    if (!success) {
      return res.status(404).json({ message: 'Активная подписка не найдена' });
    }
    
    res.status(200).json({
      message: 'Автопродление подписки включено',
      subscription: {
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
        autoRenew: true
      }
    });
  } catch (error) {
    console.error('Ошибка включения автопродления подписки:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обработка webhook от Telegram Payments
export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const { payment_id, telegram_id, status, amount } = req.body;
    
    if (!payment_id || !telegram_id || !status) {
      return res.status(400).json({ message: 'Отсутствуют обязательные параметры' });
    }
    
    // Находим пользователя по telegramId
    const user = await User.findOne({ telegramId: telegram_id });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Обрабатываем успешный платеж
    if (status === 'successful') {
      await paymentService.handleSuccessfulPayment(telegram_id, payment_id, amount);
      
      // Отправляем инвайт-ссылку в закрытый канал
      const channelLink = process.env.TELEGRAM_CHANNEL_LINK || 'https://t.me/+exampleinvitelink';
      await telegramService.sendChannelInvite(telegram_id, channelLink);
    }
    
    res.status(200).json({ message: 'Webhook обработан успешно' });
  } catch (error) {
    console.error('Ошибка обработки webhook платежа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}; 