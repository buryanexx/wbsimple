import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

if (!TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN не указан в .env файле');
  process.exit(1);
}

// Инициализация бота
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Обработка команды /start
bot.start((ctx) => {
  ctx.reply(
    'Добро пожаловать в WB Simple! 🚀\n\n' +
    'Образовательная платформа для обучения заработку на Wildberries с нуля до 1.000.000 рублей.\n\n' +
    'Используйте кнопку ниже, чтобы открыть приложение:'
  );
  
  // Отправляем кнопку для открытия Mini App
  ctx.reply('Открыть WB Simple', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть приложение', web_app: { url: process.env.WEBAPP_URL || 'https://example.com' } }]
      ]
    }
  });
});

// Обработка команды /help
bot.help((ctx) => {
  ctx.reply(
    'WB Simple - образовательная платформа для обучения заработку на Wildberries.\n\n' +
    'Доступные команды:\n' +
    '/start - Начать работу с ботом\n' +
    '/help - Показать справку\n' +
    '/subscription - Информация о подписке'
  );
});

// Обработка команды /subscription
bot.command('subscription', (ctx) => {
  ctx.reply(
    'Подписка на WB Simple дает вам:\n\n' +
    '✅ Полный доступ ко всем 8 модулям курса\n' +
    '✅ Библиотеку шаблонов и фишек для продавцов\n' +
    '✅ Доступ в закрытый Telegram-канал\n' +
    '✅ Обновления и новые материалы\n\n' +
    'Стоимость подписки: 999 ₽/месяц\n\n' +
    'Для оформления подписки используйте приложение:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Оформить подписку', web_app: { url: `${process.env.WEBAPP_URL || 'https://example.com'}/subscription` } }]
        ]
      }
    }
  );
});

// Функция для отправки уведомления пользователю
export const sendNotification = async (telegramId: number, message: string): Promise<void> => {
  try {
    await bot.telegram.sendMessage(telegramId, message);
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error);
  }
};

// Функция для отправки инвайт-ссылки в закрытый канал
export const sendChannelInvite = async (telegramId: number, channelLink: string): Promise<void> => {
  try {
    await bot.telegram.sendMessage(
      telegramId,
      'Поздравляем! Вы получили доступ к закрытому каналу WB Simple.\n\n' +
      'Используйте ссылку ниже для входа:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Присоединиться к каналу', url: channelLink }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('Ошибка отправки инвайт-ссылки:', error);
  }
};

// Запуск бота
export const startBot = async (): Promise<void> => {
  try {
    await bot.launch();
    console.log('Telegram бот запущен');
  } catch (error) {
    console.error('Ошибка запуска Telegram бота:', error);
  }
};

// Остановка бота при завершении работы приложения
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default {
  bot,
  startBot,
  sendNotification,
  sendChannelInvite
}; 