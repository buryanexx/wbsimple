import crypto from 'crypto';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

// Тип для данных Telegram авторизации
export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Сервис для работы с Telegram
 */
class TelegramService {
  private readonly botToken: string;
  private readonly secretKey: Buffer;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    
    if (!this.botToken) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN не задан. Функциональность Telegram будет ограничена.');
    }
    
    // Создание секретного ключа из токена бота
    this.secretKey = crypto
      .createHash('sha256')
      .update(this.botToken)
      .digest();
  }

  /**
   * Проверяет данные аутентификации от Telegram
   * @param authData Данные аутентификации от Telegram
   * @returns true если данные валидны
   */
  validateAuthData(authData: TelegramAuthData): boolean {
    if (!this.botToken) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN не задан. Проверка не выполнена.');
      return true; // В режиме разработки пропускаем проверку
    }
    
    // Получаем хэш для проверки
    const { hash, ...data } = authData;
    
    // Проверяем срок действия данных (не старше 24 часов)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authData.auth_date > 86400) {
      console.warn('Данные авторизации Telegram устарели.');
      return false;
    }
    
    // Создаем строку для проверки
    const checkString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key as keyof typeof data]}`)
      .join('\n');
    
    // Создаем хэш для проверки
    const hmac = crypto
      .createHmac('sha256', this.secretKey)
      .update(checkString)
      .digest('hex');
    
    // Проверяем хэш
    return hmac === hash;
  }

  /**
   * Преобразует данные Telegram в объект пользователя
   * @param authData Данные аутентификации от Telegram
   * @returns Объект пользователя
   */
  transformUserData(authData: TelegramAuthData) {
    return {
      telegramId: authData.id.toString(),
      firstName: authData.first_name,
      lastName: authData.last_name || '',
      username: authData.username || '',
      photoUrl: authData.photo_url || '',
      authDate: new Date(authData.auth_date * 1000),
    };
  }
}

// Экспорт экземпляра сервиса
export const telegramService = new TelegramService(); 