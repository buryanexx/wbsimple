// Базовый URL API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

// Настройки для Telegram Web App
export const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'wb_simple_bot';

// Настройки для видеоплеера
export const VIDEO_PLAYER_CONFIG = {
  PROGRESS_UPDATE_INTERVAL: 10000, // Интервал обновления прогресса просмотра видео (мс)
  COMPLETE_THRESHOLD: 90, // Процент просмотра, при котором видео считается просмотренным
};

// Настройки для аутентификации
export const AUTH_CONFIG = {
  TOKEN_KEY: 'wb_simple_token',
  USER_KEY: 'wb_simple_user',
  INIT_DATA_KEY: 'telegram_init_data',
};

// Настройки для подписки
export const SUBSCRIPTION_CONFIG = {
  FREE_MODULE_ID: 1, // ID бесплатного модуля
};

// Версия приложения
export const APP_VERSION = '1.0.0'; 