import { Request, Response } from 'express';
import { User, Subscription } from '../models/index.js';
import telegramService from '../services/telegramService.js';
import paymentService from '../services/paymentService.js';

// Контроллер для работы с подписками
const subscriptionController = {
  // Получение информации о подписке текущего пользователя
  getSubscriptionInfo: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Находим пользователя по ID
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Находим активную подписку пользователя
      const activeSubscription = await Subscription.findOne({
        where: {
          userId,
          status: 'active',
        },
        order: [['endDate', 'DESC']],
      });
      
      // Формируем ответ
      const subscriptionInfo = {
        hasActiveSubscription: user.hasActiveSubscription,
        subscriptionEndDate: user.subscriptionEndDate,
        autoRenewal: user.autoRenewal,
        subscription: activeSubscription || null,
      };
      
      res.status(200).json(subscriptionInfo);
    } catch (error) {
      console.error('Ошибка получения информации о подписке:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении информации о подписке' });
    }
  },
  
  // Создание новой подписки
  createSubscription: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { plan } = req.body;
      
      // Проверяем, что указан план подписки
      if (!plan) {
        return res.status(400).json({ message: 'Необходимо указать план подписки' });
      }
      
      // Находим пользователя по ID
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Проверяем, есть ли у пользователя активная подписка
      if (user.hasActiveSubscription) {
        return res.status(400).json({ message: 'У пользователя уже есть активная подписка' });
      }
      
      // Определяем стоимость и длительность подписки в зависимости от плана
      let amount = 0;
      let durationDays = 0;
      
      switch (plan) {
        case 'monthly':
          amount = 499;
          durationDays = 30;
          break;
        case 'quarterly':
          amount = 1299;
          durationDays = 90;
          break;
        case 'yearly':
          amount = 4999;
          durationDays = 365;
          break;
        default:
          return res.status(400).json({ message: 'Некорректный план подписки' });
      }
      
      // Создаем инвойс для оплаты через Telegram
      const invoice = await telegramService.createInvoice(
        user.telegramId,
        `Подписка на WB Simple (${plan})`,
        `Доступ к образовательной платформе WB Simple на ${durationDays} дней`,
        amount,
        { userId: user.id, plan, durationDays }
      );
      
      res.status(200).json({ invoiceLink: invoice.payment_url });
    } catch (error) {
      console.error('Ошибка создания подписки:', error);
      res.status(500).json({ message: 'Ошибка сервера при создании подписки' });
    }
  },
  
  // Отмена автопродления подписки
  cancelAutoRenewal: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Находим пользователя по ID
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Проверяем, есть ли у пользователя активная подписка
      if (!user.hasActiveSubscription) {
        return res.status(400).json({ message: 'У пользователя нет активной подписки' });
      }
      
      // Отключаем автопродление
      await user.update({ autoRenewal: false });
      
      res.status(200).json({ message: 'Автопродление подписки отключено' });
    } catch (error) {
      console.error('Ошибка отключения автопродления:', error);
      res.status(500).json({ message: 'Ошибка сервера при отключении автопродления' });
    }
  },
  
  // Включение автопродления подписки
  enableAutoRenewal: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Находим пользователя по ID
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Проверяем, есть ли у пользователя активная подписка
      if (!user.hasActiveSubscription) {
        return res.status(400).json({ message: 'У пользователя нет активной подписки' });
      }
      
      // Включаем автопродление
      await user.update({ autoRenewal: true });
      
      res.status(200).json({ message: 'Автопродление подписки включено' });
    } catch (error) {
      console.error('Ошибка включения автопродления:', error);
      res.status(500).json({ message: 'Ошибка сервера при включении автопродления' });
    }
  },
  
  // Обработка вебхука платежа
  handlePaymentWebhook: async (req: Request, res: Response) => {
    try {
      const { payment_id, metadata } = req.body;
      
      // Проверяем, что есть ID платежа и метаданные
      if (!payment_id || !metadata) {
        return res.status(400).json({ message: 'Некорректные данные платежа' });
      }
      
      const { userId, plan, durationDays } = metadata;
      
      // Проверяем статус платежа
      const paymentStatus = await paymentService.checkPaymentStatus(payment_id);
      
      if (paymentStatus !== 'paid') {
        return res.status(400).json({ message: 'Платеж не подтвержден' });
      }
      
      // Находим пользователя по ID
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Определяем даты начала и окончания подписки
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      
      // Определяем сумму платежа
      let amount = 0;
      
      switch (plan) {
        case 'monthly':
          amount = 499;
          break;
        case 'quarterly':
          amount = 1299;
          break;
        case 'yearly':
          amount = 4999;
          break;
      }
      
      // Создаем новую подписку
      const subscription = await Subscription.create({
        userId,
        startDate,
        endDate,
        paymentId: payment_id,
        amount,
        status: 'active',
        autoRenewal: true,
      });
      
      // Обновляем данные пользователя
      await user.update({
        hasActiveSubscription: true,
        subscriptionEndDate: endDate,
        autoRenewal: true,
      });
      
      // Отправляем приглашение в канал
      await telegramService.sendChannelInvite(user.telegramId);
      
      res.status(200).json({ message: 'Подписка успешно активирована' });
    } catch (error) {
      console.error('Ошибка обработки платежа:', error);
      res.status(500).json({ message: 'Ошибка сервера при обработке платежа' });
    }
  },
};

export default subscriptionController; 