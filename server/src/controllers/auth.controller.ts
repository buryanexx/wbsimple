import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Интерфейс для данных пользователя Telegram
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

// Интерфейс для инициализационных данных Telegram
interface TelegramAuthData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  start_param?: string;
}

/**
 * Контроллер для управления аутентификацией
 */
export class AuthController {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
  private readonly TOKEN_EXPIRES_IN = '24h';
  private readonly TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
  
  /**
   * Проверяет валидность данных от Telegram Web App
   * @param initData строка initData от Telegram Web App
   * @returns boolean true если данные валидны
   */
  private validateTelegramWebAppData(initData: string): boolean {
    if (!this.TELEGRAM_BOT_TOKEN) {
      logger.warn('TELEGRAM_BOT_TOKEN не установлен в .env файле. Проверка данных Telegram пропущена.');
      return true; // В режиме разработки пропускаем проверку
    }

    try {
      const telegramData = this.parseTelegramData(initData);
      if (!telegramData) return false;
      
      const { hash, ...data } = telegramData;
      if (!hash) return false;
      
      // Создаем secret_key на основе токена бота
      const secretKey = crypto
        .createHash('sha256')
        .update(this.TELEGRAM_BOT_TOKEN)
        .digest();
      
      // Сортируем параметры и создаем проверочную строку
      const checkString = Object.keys(data)
        .sort()
        .map(k => `${k}=${data[k as keyof typeof data]}`)
        .join('\n');
      
      // Создаем hmac для проверки
      const hmac = crypto
        .createHmac('sha256', secretKey)
        .update(checkString)
        .digest('hex');
      
      return hmac === hash;
    } catch (error) {
      logger.error('Ошибка при проверке данных Telegram', { error });
      return false;
    }
  }
  
  /**
   * Парсит строку initData от Telegram Web App
   */
  private parseTelegramData(initData: string): TelegramAuthData | null {
    try {
      // Строка initData имеет формат: "key1=value1&key2=value2"
      const data: Record<string, any> = {};
      const params = new URLSearchParams(initData);
      
      params.forEach((value, key) => {
        if (key === 'user') {
          try {
            data[key] = JSON.parse(value);
          } catch (e) {
            logger.error('Не удалось распарсить JSON из user параметра', { value });
            data[key] = value;
          }
        } else {
          if (key === 'auth_date') {
            data[key] = parseInt(value);
          } else {
            data[key] = value;
          }
        }
      });
      
      return data as TelegramAuthData;
    } catch (error) {
      logger.error('Ошибка при парсинге данных Telegram', { error, initData });
      return null;
    }
  }
  
  /**
   * Авторизация через Telegram
   */
  async telegramAuth(req: Request, res: Response): Promise<void> {
    try {
      const { initData, telegramUser } = req.body;
      
      // Проверяем наличие необходимых данных
      if (!initData || !telegramUser || !telegramUser.id) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Недостаточно данных для авторизации'
        });
        return;
      }
      
      // В production среде проверяем валидность данных от Telegram
      if (process.env.NODE_ENV === 'production') {
        if (!this.validateTelegramWebAppData(initData)) {
          logger.warn('Попытка авторизации с недействительными данными Telegram', { 
            telegramId: telegramUser.id 
          });
          
          res.status(403).json({
            status: 'ERROR',
            message: 'Невалидные данные авторизации Telegram'
          });
          return;
        }
      }
      
      // Проверка устаревших данных (больше 24 часов)
      const telegramData = this.parseTelegramData(initData);
      if (telegramData && telegramData.auth_date) {
        const authDate = telegramData.auth_date * 1000; // Переводим в миллисекунды
        const currentTime = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
        
        if (currentTime - authDate > maxAge) {
          logger.warn('Попытка авторизации с устаревшими данными Telegram', { 
            telegramId: telegramUser.id,
            authDate: new Date(authDate).toISOString()
          });
          
          res.status(403).json({
            status: 'ERROR',
            message: 'Данные авторизации устарели'
          });
          return;
        }
      }
      
      // Проверяем существование пользователя
      let user = await prisma.user.findUnique({
        where: {
          telegramId: telegramUser.id.toString()
        },
        include: {
          progress: true
        }
      });
      
      // Если пользователь не найден, создаем нового
      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId: telegramUser.id.toString(),
            username: telegramUser.username || `user_${telegramUser.id}`,
            firstName: telegramUser.first_name,
            lastName: telegramUser.last_name || '',
            photoUrl: telegramUser.photo_url || '',
            role: 'USER',
            hasActiveSubscription: false,
            autoRenewal: false,
            progress: {
              create: {
                completedLessons: [],
                completedModules: [],
                lastActivity: new Date()
              }
            }
          },
          include: {
            progress: true
          }
        });
        
        logger.info('Новый пользователь зарегистрирован через Telegram', { userId: user.id });
      } else {
        // Обновляем информацию о пользователе, если она изменилась
        if (user && (
          user.firstName !== telegramUser.first_name ||
          user.lastName !== (telegramUser.last_name || '') ||
          user.username !== (telegramUser.username || `user_${telegramUser.id}`) ||
          (telegramUser.photo_url && user.photoUrl !== telegramUser.photo_url)
        )) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name || '',
              username: telegramUser.username || `user_${telegramUser.id}`,
              ...(telegramUser.photo_url && { photoUrl: telegramUser.photo_url })
            },
            include: {
              progress: true
            }
          });
          
          logger.info('Обновлена информация пользователя Telegram', { userId: user.id });
        }
      }
      
      // Генерируем JWT-токен
      const token = this.generateToken({
        id: user.id,
        telegramId: user.telegramId,
        role: user.role
      });
      
      // Генерируем refresh токен
      const refreshToken = this.generateRefreshToken({
        id: user.id,
        telegramId: user.telegramId,
        role: user.role
      });
      
      // Создаем объект для ответа
      const userResponse = {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        role: user.role,
        isAdmin: user.role === 'ADMIN',
        hasActiveSubscription: user.hasActiveSubscription,
        subscriptionEndDate: user.subscriptionEndDate,
        autoRenewal: user.autoRenewal,
        progress: user.progress ? {
          completedLessons: user.progress.completedLessons || [],
          completedModules: user.progress.completedModules || []
        } : {
          completedLessons: [],
          completedModules: []
        }
      };
      
      // Отправляем ответ
      res.status(200).json({
        status: 'OK',
        data: {
          user: userResponse,
          token,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Ошибка при авторизации через Telegram', { error });
      res.status(500).json({
        status: 'ERROR',
        message: 'Внутренняя ошибка сервера при авторизации'
      });
    }
  }
  
  /**
   * Получение информации о текущем пользователе
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'ERROR',
          message: 'Пользователь не авторизован'
        });
        return;
      }
      
      // Получаем данные пользователя из базы
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id
        }
      });
      
      if (!user) {
        res.status(404).json({
          status: 'ERROR',
          message: 'Пользователь не найден'
        });
        return;
      }
      
      // Отправляем ответ
      res.status(200).json({
        status: 'OK',
        data: {
          user: {
            id: user.id,
            telegramId: user.telegramId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
            role: user.role
          }
        }
      });
    } catch (error) {
      logger.error('Ошибка при получении информации о пользователе', { error, userId: req.user?.id });
      res.status(500).json({
        status: 'ERROR',
        message: 'Внутренняя ошибка сервера'
      });
    }
  }
  
  /**
   * Обновление токена по refresh токену
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          status: 'ERROR',
          message: 'Refresh токен не предоставлен'
        });
        return;
      }
      
      // Верифицируем refresh токен
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET + '_refresh') as {
        id: string;
        telegramId: string;
        role: string;
      };
      
      // Проверяем существование пользователя
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id
        }
      });
      
      if (!user) {
        res.status(401).json({
          status: 'ERROR',
          message: 'Недействительный или просроченный refresh токен'
        });
        return;
      }
      
      // Генерируем новые токены
      const token = this.generateToken({
        id: user.id,
        telegramId: user.telegramId,
        role: user.role
      });
      
      // Генерируем новый refresh токен
      const newRefreshToken = jwt.sign(
        {
          id: user.id,
          telegramId: user.telegramId,
          role: user.role
        },
        this.JWT_SECRET + '_refresh',
        { expiresIn: '7d' }
      );
      
      // Отправляем новые токены клиенту
      res.status(200).json({
        status: 'OK',
        data: { 
          token,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      logger.error('Ошибка при обновлении токена', { error });
      res.status(500).json({
        status: 'ERROR',
        message: 'Внутренняя ошибка сервера при обновлении токена'
      });
    }
  }
  
  /**
   * Вспомогательный метод для генерации JWT-токена
   */
  private generateToken(payload: { id: string; telegramId: string; role: string }): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRES_IN
    });
  }
  
  /**
   * Вспомогательный метод для генерации refresh токена
   */
  private generateRefreshToken(payload: { id: string; telegramId: string; role: string }): string {
    return jwt.sign(payload, this.JWT_SECRET + '_refresh', {
      expiresIn: '7d' // Refresh токен действителен 7 дней
    });
  }
}