import winston from 'winston';
import path from 'path';
import config from '../config';
import fs from 'fs';

// Создаем директорию для логов, если она не существует
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Определяем форматы для логирования
const formats = [
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
];

// Создаем логгер
export const logger = winston.createLogger({
  level: config.app.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(...formats),
  defaultMeta: { service: 'wb-simple-api' },
  transports: [
    // Логирование в файлы
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exitOnError: false
});

// В development режиме добавляем вывод в консоль
if (config.app.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      )
    })
  );
}

// Функция для форматирования ошибок перед логированием
export const formatError = (err: Error | any): object => {
  if (err instanceof Error) {
    return {
      message: err.message,
      stack: err.stack,
      ...(err as any)
    };
  }
  return err;
};

export default logger; 