import { Redis } from 'ioredis';
import { MockRedis } from './mock-redis';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

/**
 * Фабрика для создания экземпляра Redis
 * В режиме разработки без Redis будет использоваться мок-версия
 */
export const createRedisClient = (): Redis | MockRedis => {
  const redisUrl = process.env.REDIS_URL;

  // Проверяем доступность Redis
  try {
    // Если URL не указан, используем мок-версию
    if (!redisUrl) {
      console.warn('⚠️ REDIS_URL не указан, используем мок-версию Redis');
      return new MockRedis() as unknown as Redis;
    }

    // Создаем реальный клиент Redis
    const client = new Redis(redisUrl);

    // Проверяем доступность Redis
    client.on('error', (error) => {
      if (error.message.includes('ECONNREFUSED')) {
        console.warn(`⚠️ Не удалось подключиться к Redis (${redisUrl}), используем мок-версию Redis`);
        // Заменяем клиент на мок-версию
        return new MockRedis() as unknown as Redis;
      }
    });

    // Возвращаем реальный клиент Redis
    return client;
  } catch (error) {
    console.warn('⚠️ Ошибка при создании клиента Redis, используем мок-версию');
    return new MockRedis() as unknown as Redis;
  }
};

// Экспортируем экземпляр Redis/MockRedis
export const redis = createRedisClient(); 