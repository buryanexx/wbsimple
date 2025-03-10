import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/index.js';

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

// Middleware для проверки JWT токена
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }
    
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { id: number };
    
    // Находим пользователя по ID из токена
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    // Добавляем пользователя в объект запроса
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Недействительный токен' });
    }
    
    if ((error as Error).name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Срок действия токена истек' });
    }
    
    res.status(500).json({ message: 'Ошибка сервера при аутентификации' });
  }
};

// Middleware для проверки подписки
export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    if (!user.hasActiveSubscription) {
      return res.status(403).json({ message: 'Требуется активная подписка' });
    }
    
    next();
  } catch (error) {
    console.error('Ошибка проверки подписки:', error);
    res.status(500).json({ message: 'Ошибка сервера при проверке подписки' });
  }
}; 