import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

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

// Контроллер для аутентификации
const authController = {
  // Аутентификация через Telegram
  telegramAuth: async (req: Request, res: Response) => {
    try {
      const telegramData: TelegramAuthData = req.body;
      
      // Проверка данных аутентификации Telegram
      // В реальном приложении здесь должна быть проверка хеша
      
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
      }
      
      // Создание JWT токена
      const token = jwt.sign(
        { id: user.id, telegramId: user.telegramId },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '30d' }
      );
      
      // Отправка токена и данных пользователя
      res.status(200).json({
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
        },
      });
    } catch (error) {
      console.error('Ошибка аутентификации через Telegram:', error);
      res.status(500).json({ message: 'Ошибка сервера при аутентификации' });
    }
  },
  
  // Получение данных текущего пользователя
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      // Получаем ID пользователя из объекта запроса (добавляется middleware)
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Не авторизован' });
      }
      
      // Поиск пользователя по ID
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Отправка данных пользователя
      res.status(200).json({
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        isAdmin: user.isAdmin,
        hasActiveSubscription: user.hasActiveSubscription,
        subscriptionEndDate: user.subscriptionEndDate,
      });
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении данных пользователя' });
    }
  },
};

export default authController; 