import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware для проверки прав администратора
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Проверяем, что пользователь авторизован и имеет роль админа
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      status: 'ERROR',
      message: 'Доступ запрещен. Требуются права администратора'
    });
    return;
  }
  
  // Если пользователь имеет права админа, передаем запрос дальше
  next();
}; 