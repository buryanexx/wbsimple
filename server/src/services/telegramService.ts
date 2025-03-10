import { Telegraf, Context } from 'telegraf';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

if (!TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN не указан в .env файле');
  process.exit(1);
}

// Инициализация бота
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Сервис для работы с Telegram
const telegramService = {
  // Экземпляр бота
  bot,
  
  // Запуск бота
  startBot: async (): Promise<void> => {
    try {
      // Настраиваем команды бота
      await bot.telegram.setMyCommands([
        { command: 'start', description: 'Начать работу с ботом' },
        { command: 'help', description: 'Получить помощь' },
        { command: 'subscription', description: 'Информация о подписке' },
      ]);
      
      // Обработчик команды /start
      bot.command('start', async (ctx) => {
        await ctx.reply(
          'Добро пожаловать в WB Simple! 👋\n\n' +
          'Это образовательная платформа для продавцов на Wildberries.\n\n' +
          'Используйте команду /subscription для получения информации о подписке.'
        );
      });
      
      // Обработчик команды /help
      bot.command('help', async (ctx) => {
        await ctx.reply(
          'Команды бота:\n\n' +
          '/start - Начать работу с ботом\n' +
          '/help - Получить помощь\n' +
          '/subscription - Информация о подписке'
        );
      });
      
      // Обработчик команды /subscription
      bot.command('subscription', async (ctx) => {
        await ctx.reply(
          'Для получения информации о подписке и управления ею, пожалуйста, воспользуйтесь веб-приложением.'
        );
      });
      
      // Запускаем бота
      await bot.launch();
      console.log('Telegram бот запущен');
    } catch (error) {
      console.error('Ошибка запуска Telegram бота:', error);
      throw error;
    }
  },
  
  // Отправка уведомления пользователю
  sendNotification: async (telegramId: string, message: string): Promise<void> => {
    try {
      await bot.telegram.sendMessage(telegramId, message);
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
      throw error;
    }
  },
  
  // Отправка приглашения в канал
  sendChannelInvite: async (telegramId: string): Promise<void> => {
    try {
      const channelLink = process.env.TELEGRAM_CHANNEL_LINK || 'https://t.me/+exampleinvitelink';
      
      await bot.telegram.sendMessage(
        telegramId,
        `Поздравляем! Ваша подписка активирована. Теперь у вас есть доступ к закрытому каналу: ${channelLink}`
      );
    } catch (error) {
      console.error('Ошибка отправки приглашения в канал:', error);
      throw error;
    }
  },
  
  // Создание инвойса для оплаты
  createInvoice: async (
    telegramId: string,
    title: string,
    description: string,
    amount: number,
    metadata: any
  ): Promise<{ payment_url: string }> => {
    try {
      // В реальном приложении здесь должен быть запрос к Telegram Payments API
      // для создания инвойса
      
      // Для демонстрации возвращаем фиктивную ссылку на оплату
      return {
        payment_url: `https://t.me/invoice/example_${Date.now()}`
      };
    } catch (error) {
      console.error('Ошибка создания инвойса:', error);
      throw error;
    }
  },
};

export default telegramService; 