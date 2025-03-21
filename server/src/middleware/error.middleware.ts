import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import config from '../config';

/**
 * Класс API ошибки
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Middleware для обработки ошибок
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // По умолчанию статус 500
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';
  let isOperational = false;
  
  // Если это наша API ошибка, используем её данные
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }
  
  // Логируем ошибку
  logger.error(message, {
    error: err,
    path: req.path,
    method: req.method,
    statusCode,
    isOperational,
    requestId: req.headers['x-request-id'] || ''
  });
  
  // Возвращаем стандартизированный ответ с ошибкой
  res.status(statusCode).json({
    error: {
      message,
      // Включаем стек только в режиме разработки
      ...(config.app.env === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Middleware для обработки несуществующих маршрутов (404)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new ApiError(404, `Маршрут не найден: ${req.originalUrl}`);
  next(err);
};

/**
 * Фабрика создания API ошибок
 */
export const createApiError = {
  badRequest: (message = 'Некорректный запрос') => new ApiError(400, message),
  unauthorized: (message = 'Требуется авторизация') => new ApiError(401, message),
  forbidden: (message = 'Доступ запрещен') => new ApiError(403, message),
  notFound: (message = 'Ресурс не найден') => new ApiError(404, message),
  methodNotAllowed: (message = 'Метод не разрешен') => new ApiError(405, message),
  conflict: (message = 'Конфликт данных') => new ApiError(409, message),
  tooMany: (message = 'Слишком много запросов') => new ApiError(429, message),
  internal: (message = 'Внутренняя ошибка сервера') => new ApiError(500, message, false)
}; 