import { app, prisma, redis } from './app';
import { logger } from './utils/logger';
import config from './config';

// Подключение к базам данных и запуск сервера
const startServer = async () => {
  try {
    // Проверка подключения к PostgreSQL
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');
    
    // Проверка подключения к Redis
    await redis.ping();
    logger.info('Connected to Redis');
    
    // Запуск сервера
    const server = app.listen(config.app.port, () => {
      logger.info(`🚀 Server started in ${config.app.env} mode`);
      logger.info(`🌐 Server running at http://${config.app.host}:${config.app.port}`);
      logger.info(`🔍 API docs available at http://${config.app.host}:${config.app.port}/api-docs`);
    });
    
    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Server shutting down...');
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Закрытие подключений к базам данных
        await prisma.$disconnect();
        logger.info('PostgreSQL connection closed');
        
        await redis.quit();
        logger.info('Redis connection closed');
        
        process.exit(0);
      });
      
      // Принудительное завершение через 10 секунд
      setTimeout(() => {
        logger.error('Forcing server shutdown...');
        process.exit(1);
      }, 10000);
    };
    
    // Обработка сигналов для graceful shutdown
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Запуск сервера
startServer(); 