import dotenv from 'dotenv';
import telegramService from './telegramService.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

dotenv.config();

const TELEGRAM_PAYMENT_TOKEN = process.env.TELEGRAM_PAYMENT_TOKEN || '';
const bot = telegramService.bot;

if (!TELEGRAM_PAYMENT_TOKEN) {
  console.error('TELEGRAM_PAYMENT_TOKEN не указан в .env файле');
}

// Функция для создания инвойса
export const createInvoice = async (telegramId: number): Promise<string> => {
  try {
    // Находим пользователя
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Создаем уникальный идентификатор платежа
    const paymentId = `payment_${Date.now()}_${telegramId}`;
    
    // Создаем инвойс
    const invoice = {
      chat_id: telegramId,
      title: 'Подписка на WB Simple',
      description: 'Ежемесячная подписка на образовательную платформу WB Simple',
      payload: paymentId,
      provider_token: TELEGRAM_PAYMENT_TOKEN,
      currency: 'RUB',
      prices: [
        { label: 'Подписка на 1 месяц', amount: 99900 } // 999 рублей в копейках
      ],
      start_parameter: 'subscription',
      photo_url: 'https://example.com/subscription_image.jpg', // URL изображения для инвойса
      photo_width: 600,
      photo_height: 400,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      is_flexible: false
    };
    
    // Отправляем инвойс
    await bot.telegram.sendInvoice(telegramId, invoice);
    
    return paymentId;
  } catch (error) {
    console.error('Ошибка создания инвойса:', error);
    throw error;
  }
};

// Функция для обработки успешного платежа
export const handleSuccessfulPayment = async (telegramId: number, paymentId: string, amount: number): Promise<void> => {
  try {
    // Находим пользователя
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    // Вычисляем дату окончания подписки (30 дней от текущей даты)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    // Создаем новую подписку
    const newSubscription = new Subscription({
      userId: user._id,
      telegramId,
      startDate,
      endDate,
      paymentId,
      amount,
      status: 'active',
      autoRenew: true
    });
    
    await newSubscription.save();
    
    // Обновляем информацию о подписке пользователя
    user.isSubscribed = true;
    user.subscriptionExpiry = endDate;
    await user.save();
    
    // Отправляем уведомление пользователю
    await bot.telegram.sendMessage(
      telegramId,
      'Поздравляем! Ваша подписка на WB Simple успешно оформлена.\n\n' +
      `Дата окончания подписки: ${endDate.toLocaleDateString()}\n\n` +
      'Теперь вам доступны все материалы курса и библиотека шаблонов.'
    );
  } catch (error) {
    console.error('Ошибка обработки успешного платежа:', error);
    throw error;
  }
};

// Функция для проверки статуса подписки
export const checkSubscriptionStatus = async (telegramId: number): Promise<boolean> => {
  try {
    // Находим пользователя
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      return false;
    }
    
    // Проверяем статус подписки
    if (!user.isSubscribed) {
      return false;
    }
    
    // Проверяем, не истекла ли подписка
    if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
      // Обновляем статус подписки
      user.isSubscribed = false;
      await user.save();
      
      // Находим активную подписку и обновляем ее статус
      const subscription = await Subscription.findOne({
        telegramId,
        status: 'active'
      }).sort({ createdAt: -1 });
      
      if (subscription) {
        subscription.status = 'expired';
        await subscription.save();
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка проверки статуса подписки:', error);
    return false;
  }
};

// Функция для отмены автопродления подписки
export const cancelAutoRenewal = async (telegramId: number): Promise<boolean> => {
  try {
    // Находим активную подписку пользователя
    const subscription = await Subscription.findOne({
      telegramId,
      status: 'active'
    }).sort({ createdAt: -1 });
    
    if (!subscription) {
      return false;
    }
    
    // Отключаем автопродление
    subscription.autoRenew = false;
    await subscription.save();
    
    // Отправляем уведомление пользователю
    await bot.telegram.sendMessage(
      telegramId,
      'Автопродление подписки отключено.\n\n' +
      `Ваша подписка будет активна до ${subscription.endDate.toLocaleDateString()}.`
    );
    
    return true;
  } catch (error) {
    console.error('Ошибка отмены автопродления подписки:', error);
    return false;
  }
};

// Функция для включения автопродления подписки
export const enableAutoRenewal = async (telegramId: number): Promise<boolean> => {
  try {
    // Находим активную подписку пользователя
    const subscription = await Subscription.findOne({
      telegramId,
      status: 'active'
    }).sort({ createdAt: -1 });
    
    if (!subscription) {
      return false;
    }
    
    // Включаем автопродление
    subscription.autoRenew = true;
    await subscription.save();
    
    // Отправляем уведомление пользователю
    await bot.telegram.sendMessage(
      telegramId,
      'Автопродление подписки включено.\n\n' +
      'Ваша подписка будет автоматически продлеваться каждый месяц.'
    );
    
    return true;
  } catch (error) {
    console.error('Ошибка включения автопродления подписки:', error);
    return false;
  }
};

export default {
  createInvoice,
  handleSuccessfulPayment,
  checkSubscriptionStatus,
  cancelAutoRenewal,
  enableAutoRenewal
}; 