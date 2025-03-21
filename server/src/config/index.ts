import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения из .env файла
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

/**
 * Конфигурация приложения
 */
const config = {
  app: {
    env: nodeEnv,
    port: parseInt(process.env.PORT || '5005', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@wbsimple.ru'
  },
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wbsimple'
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10) // время жизни кэша в секундах
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-should-be-in-env',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d', // срок действия токена
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' // срок действия refresh токена
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || ''
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info', // error, warn, info, http, debug
    maxSize: process.env.LOG_MAX_SIZE || '10m', // максимальный размер файла
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10) // максимальное количество файлов
  },
  
  storage: {
    uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10', 10) * 1024 * 1024 // в байтах (по умолчанию 10MB)
  },
  
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'yookassa',
    shopId: process.env.YOOKASSA_SHOP_ID || '',
    secretKey: process.env.YOOKASSA_SECRET_KEY || '',
    returnUrl: process.env.PAYMENT_RETURN_URL || 'https://wbsimple.ru/payment/success'
  }
};

export default config; 