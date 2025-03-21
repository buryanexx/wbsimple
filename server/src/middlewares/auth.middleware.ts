import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Расширяем интерфейс Request, чтобы включить информацию о пользователе
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        telegramId: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware для проверки JWT-токена и аутентификации пользователя
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'ERROR',
        message: 'Отсутствует токен авторизации'
      });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    // Проверяем, не находится ли токен в черном списке (через Prisma)
    const blacklistedToken = await prisma.blacklistedToken.findUnique({
      where: {
        token
      }
    });
    
    if (blacklistedToken) {
      res.status(401).json({
        status: 'ERROR',
        message: 'Токен недействителен'
      });
      return;
    }
    
    // Верифицируем JWT-токен
    const secretKey = process.env.JWT_SECRET || 'default_jwt_secret';
    
    try {
      const decoded = jwt.verify(token, secretKey) as {
        id: string;
        telegramId: string;
        role: string;
      };
      
      // Проверяем существование пользователя в базе данных
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id
        }
      });
      
      if (!user) {
        res.status(401).json({
          status: 'ERROR',
          message: 'Пользователь не найден'
        });
        return;
      }
      
      // Добавляем информацию о пользователе в запрос
      req.user = decoded;
      
      // Передаем запрос дальше
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          status: 'ERROR',
          message: 'Срок действия токена истек'
        });
      } else {
        logger.error('Ошибка при верификации токена', { error });
        res.status(401).json({
          status: 'ERROR',
          message: 'Недействительный токен'
        });
      }
    }
  } catch (error) {
    logger.error('Ошибка в middleware аутентификации', { error });
    res.status(500).json({
      status: 'ERROR',
      message: 'Внутренняя ошибка сервера'
    });
  }
};

/**
 * Middleware для проверки роли администратора
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Требуется аутентификация',
      });
    }
    
    // Проверяем роль пользователя
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Недостаточно прав для выполнения операции',
      });
    }
    
    next();
  } catch (error) {
    console.error('Ошибка в middleware проверки прав администратора:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Внутренняя ошибка сервера при проверке прав',
    });
  }
}; 