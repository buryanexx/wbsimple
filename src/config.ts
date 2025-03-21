/**
 * Общая конфигурация приложения
 */

// Добавляем типы для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code: string;
            photo_url?: string;
          };
          auth_date: number;
          hash: string;
          start_param?: string;
        };
        colorScheme: 'light' | 'dark';
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: any;
        BackButton: any;
        openLink: (url: string) => void;
        onEvent: (eventName: string, callback: Function) => void;
        backgroundColor: string;
        textColor: string;
        hintColor: string;
        linkColor: string;
        buttonColor: string;
        buttonTextColor: string;
      };
    };
    tgInitComplete?: boolean;
    tgWebAppLogs?: any[];
    tgWebAppErrors?: any[];
    tgInitData?: Record<string, string>;
    tgInitParams?: Record<string, string>;
    safeTelegramNavigation?: (path: string) => boolean;
  }
}

// API URL для запросов
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Настройки авторизации
export const AUTH_CONFIG = {
  storageTokenKey: 'wbsimple_auth_token',
  storageUserKey: 'wbsimple_user',
  telegramLoginEnabled: true,
  // Секретный ключ для проверки целостности данных Telegram
  telegramBotToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''
};

// Основная конфигурация
export const config = {
  // Всегда используем хеш-роутинг для Telegram WebApp
  useHashRouter: true,
  
  // Имя Telegram бота
  telegramBotUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'wbsimple_bot',
  
  // Настройки платежного сервиса для Telegram WebApp
  payments: {
    enabled: true,
    provider_token: import.meta.env.VITE_PAYMENT_PROVIDER_TOKEN || '',
    monthly_subscription_price: 1899, // Цена в рублях
    currency: 'RUB',
    test: import.meta.env.VITE_PAYMENT_TEST_MODE === 'true'
  },
  
  // Отключение логирования в продакшне
  disableLogs: import.meta.env.VITE_DISABLE_LOGS === 'true' || import.meta.env.PROD,
  
  // Настройки навигации в Telegram WebApp
  telegram: {
    // Включить или выключить быструю навигацию
    fastNavigation: true,
    
    // Настройки Main Button
    mainButton: {
      text: 'Начать', // Текст по умолчанию
      color: '#6A45E8', // Цвет кнопки
      textColor: '#ffffff' // Цвет текста
    }
  }
};

// Хелперы для работы с Telegram WebApp
export const telegramHelpers = {
  // Проверяет, запущено ли приложение в контексте Telegram WebApp
  isRunningInTelegram: () => {
    try {
      const isTelegramWebAppAvailable = !!window.Telegram && !!window.Telegram.WebApp;
      
      // Проверка в режиме разработки - всегда возвращаем true если явно не указано иное
      if (import.meta.env.DEV && import.meta.env.VITE_FORCE_TELEGRAM_MODE !== 'false') {
        console.log('DEV режим: Эмулируем запуск в Telegram WebApp');
        return true;
      }
      
      if (isTelegramWebAppAvailable) {
        // Дополнительная проверка, что мы действительно внутри Telegram
        const hasInitData = !!window.Telegram.WebApp.initData;
        const hasInitDataUnsafe = !!window.Telegram.WebApp.initDataUnsafe;
        
        console.log('Проверка Telegram WebApp:', { 
          hasWebApp: isTelegramWebAppAvailable,
          hasInitData,
          hasInitDataUnsafe
        });
        
        return hasInitData || hasInitDataUnsafe;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при проверке Telegram WebApp:', error);
      return false;
    }
  },
  
  // Получает данные пользователя из Telegram WebApp
  getTelegramUser: () => {
    if (!telegramHelpers.isRunningInTelegram()) return null;
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  },
  
  // Получает Theme из Telegram WebApp
  getTelegramTheme: () => {
    if (!telegramHelpers.isRunningInTelegram()) return 'light';
    return window.Telegram?.WebApp?.colorScheme || 'light';
  },
  
  // Получает InitData для авторизации
  getInitData: () => {
    if (!telegramHelpers.isRunningInTelegram()) return '';
    return window.Telegram?.WebApp?.initData || '';
  }
}; 