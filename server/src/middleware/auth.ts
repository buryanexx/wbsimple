import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Расширяем интерфейс Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Получаем токен из заголовка
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }
    
    // Верифицируем токен
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Находим пользователя по ID
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Добавляем пользователя в объект запроса
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Неверный токен аутентификации' });
  }
};

// Middleware для проверки подписки
export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }
    
    if (!req.user.isSubscribed) {
      return res.status(403).json({ message: 'Требуется подписка для доступа к этому ресурсу' });
    }
    
    // Проверяем, не истекла ли подписка
    if (req.user.subscriptionExpiry && new Date(req.user.subscriptionExpiry) < new Date()) {
      // Обновляем статус подписки
      req.user.isSubscribed = false;
      await req.user.save();
      
      return res.status(403).json({ message: 'Ваша подписка истекла' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}; 