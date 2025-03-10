import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Загружаем переменные окружения в зависимости от NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}

// Получаем строку подключения из переменных окружения
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL не определен в переменных окружения');
}

// Создаем экземпляр Sequelize
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Функция для проверки подключения к базе данных
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Соединение с базой данных установлено успешно.');
  } catch (error) {
    console.error('Не удалось подключиться к базе данных:', error);
    throw error;
  }
};

export default sequelize; 