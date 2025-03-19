/**
 * Общая конфигурация приложения
 */

// API URL для запросов
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.your-production-server.com';

// Настройки авторизации
export const AUTH_CONFIG = {
  storageTokenKey: 'wbsimple_auth_token',
  storageUserKey: 'wbsimple_user',
  telegramLoginEnabled: true
};

// Основная конфигурация
export const config = {
  // Принудительно включаем хеш-роутинг для Telegram WebApp
  useHashRouter: true,
  
  // Имя Telegram бота
  telegramBotUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'wbsimple_bot',
  
  // Отключение логирования в продакшне
  disableLogs: import.meta.env.VITE_DISABLE_LOGS === 'true' || import.meta.env.PROD,
  
  // Настройки навигации в Telegram WebApp
  telegram: {
    // Включить или выключить быструю навигацию
    // Если true, то будет использоваться хеш-роутинг без перезагрузки страницы
    fastNavigation: true,
    
    // Настройки Main Button
    mainButton: {
      text: 'Начать', // Текст по умолчанию
      color: '#6A45E8', // Цвет кнопки
      textColor: '#ffffff' // Цвет текста
    }
  }
} 