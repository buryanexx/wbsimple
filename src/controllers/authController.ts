import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import crypto from 'crypto';

// Интерфейс для данных пользователя Telegram
interface TelegramAuthData {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// Функция для проверки хеша из Telegram WebApp
const validateTelegramWebAppData = (initData: string): boolean => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN не указан в .env файле');
      return false;
    }

    // Разбираем initData на параметры
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    
    if (!hash) {
      console.error('Hash не найден в данных WebApp');
      return false;
    }

    // Создаем проверочную строку из параметров
    const dataCheckArr: string[] = [];
    const sortedKeys = Array.from(params.keys()).sort();
    
    sortedKeys.forEach(key => {
      const value = params.get(key);
      if (value) {
        dataCheckArr.push(`${key}=${value}`);
      }
    });
    
    const dataCheckString = dataCheckArr.join('\n');
    
    // Создаем HMAC-SHA-256 хеш
    const secretKey = crypto.createHash('sha256')
      .update(botToken)
      .digest();
    
    const hmac = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Сравниваем хеши
    return hmac === hash;
  } catch (error) {
    console.error('Ошибка при проверке хеша Telegram WebApp:', error);
    return false;
  }
};

// Функция для разбора данных пользователя из initData
const parseTelegramUserData = (initData: string): TelegramAuthData | null => {
  try {
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    
    if (!userParam) {
      console.error('Данные пользователя не найдены в initData');
      return null;
    }
    
    const user = JSON.parse(decodeURIComponent(userParam));
    const hash = params.get('hash') || '';
    const auth_date = parseInt(params.get('auth_date') || '0', 10);
    
    return {
      id: user.id.toString(),
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
      auth_date,
      hash
    };
  } catch (error) {
    console.error('Ошибка при разборе данных пользователя:', error);
    return null;
  }
};

// Контроллер для аутентификации
const authController = {
  // Аутентификация через Telegram
  telegramAuth: async (req: Request, res: Response) => {
    try {
      const { initData } = req.body;
      
      // Проверяем, передана ли строка initData
      if (!initData) {
        return res.status(400).json({ 
          message: 'Отсутствуют данные initData',
          success: false
        });
      }
      
      // Проверяем валидность данных Telegram
      const isValid = validateTelegramWebAppData(initData);
      if (!isValid) {
        return res.status(401).json({ 
          message: 'Недействительные данные авторизации Telegram',
          success: false
        });
      }
      
      // Разбираем данные пользователя
      const telegramData = parseTelegramUserData(initData);
      if (!telegramData) {
        return res.status(400).json({ 
          message: 'Ошибка при разборе данных пользователя',
          success: false
        });
      }

      // Проверяем возраст данных аутентификации (не старше 24 часов)
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - telegramData.auth_date > 86400) {
        return res.status(401).json({ 
          message: 'Данные аутентификации устарели',
          success: false
        });
      }
      
      // Поиск пользователя по telegramId
      let user = await User.findOne({ where: { telegramId: telegramData.id } });
      
      // Если пользователь не найден, создаем нового
      if (!user) {
        user = await User.create({
          telegramId: telegramData.id,
          username: telegramData.username || `user_${telegramData.id}`,
          firstName: telegramData.first_name,
          lastName: telegramData.last_name || '',
          photoUrl: telegramData.photo_url || '',
          isAdmin: false,
          hasActiveSubscription: false,
          autoRenewal: false,
        });

        console.log(`Создан новый пользователь с telegramId: ${telegramData.id}`);
      } else {
        // Обновляем информацию о пользователе
        user.username = telegramData.username || user.username;
        user.firstName = telegramData.first_name;
        user.lastName = telegramData.last_name || user.lastName || '';
        user.photoUrl = telegramData.photo_url || user.photoUrl || '';
        await user.save();
        
        console.log(`Обновлена информация пользователя с telegramId: ${telegramData.id}`);
      }
      
      // Создание JWT токена
      const token = jwt.sign(
        { 
          id: user.id, 
          telegramId: user.telegramId,
          isAdmin: user.isAdmin
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '30d' }
      );
      
      // Отправка токена и данных пользователя
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          isAdmin: user.isAdmin,
          hasActiveSubscription: user.hasActiveSubscription,
          subscriptionEndDate: user.subscriptionEndDate,
          progress: user.progress || { completedLessons: [], completedModules: [] }
        },
      });
    } catch (error) {
      console.error('Ошибка аутентификации через Telegram:', error);
      res.status(500).json({ 
        message: 'Ошибка сервера при аутентификации',
        success: false
      });
    }
  },
  
  // Получение данных текущего пользователя
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      // Получаем ID пользователя из объекта запроса (добавляется middleware)
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          message: 'Не авторизован',
          success: false
        });
      }
      
      // Поиск пользователя по ID
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ 
          message: 'Пользователь не найден',
          success: false
        });
      }
      
      // Отправка данных пользователя
      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          isAdmin: user.isAdmin,
          hasActiveSubscription: user.hasActiveSubscription,
          subscriptionEndDate: user.subscriptionEndDate,
          progress: user.progress || { completedLessons: [], completedModules: [] }
        }
      });
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
      res.status(500).json({ 
        message: 'Ошибка сервера при получении данных пользователя',
        success: false
      });
    }
  },

  // Обновление прогресса пользователя
  updateProgress: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          message: 'Не авторизован',
          success: false
        });
      }
      
      const { lessonId, moduleId, completed } = req.body;
      
      // Проверяем, что переданы необходимые параметры
      if (lessonId === undefined && moduleId === undefined) {
        return res.status(400).json({ 
          message: 'Необходимо указать lessonId или moduleId',
          success: false
        });
      }
      
      // Находим пользователя
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ 
          message: 'Пользователь не найден',
          success: false
        });
      }
      
      // Получаем текущий прогресс пользователя
      const progress = user.progress || { completedLessons: [], completedModules: [] };
      
      // Обновляем прогресс по уроку
      if (lessonId !== undefined) {
        if (completed) {
          // Добавляем урок в список пройденных, если его там еще нет
          if (!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
          }
        } else {
          // Удаляем урок из списка пройденных
          progress.completedLessons = progress.completedLessons.filter(id => id !== lessonId);
        }
      }
      
      // Обновляем прогресс по модулю
      if (moduleId !== undefined) {
        if (completed) {
          // Добавляем модуль в список пройденных, если его там еще нет
          if (!progress.completedModules.includes(moduleId)) {
            progress.completedModules.push(moduleId);
          }
        } else {
          // Удаляем модуль из списка пройденных
          progress.completedModules = progress.completedModules.filter(id => id !== moduleId);
        }
      }
      
      // Сохраняем обновленный прогресс
      user.progress = progress;
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Прогресс успешно обновлен',
        progress
      });
    } catch (error) {
      console.error('Ошибка при обновлении прогресса:', error);
      res.status(500).json({ 
        message: 'Ошибка сервера при обновлении прогресса',
        success: false
      });
    }
  }
};

export default authController; 