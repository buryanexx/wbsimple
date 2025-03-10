import dotenv from 'dotenv';
import { User, Module, Lesson, sequelize } from '../models/index.js';
import { testDatabaseConnection } from '../config/database.js';

// Загружаем переменные окружения в зависимости от NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}

// Данные для администратора
const adminData = {
  telegramId: '123456789',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  isAdmin: true,
  hasActiveSubscription: true,
  autoRenewal: false,
};

// Данные для модулей
const modulesData = [
  {
    title: 'Введение в Wildberries',
    description: 'Основы работы с маркетплейсом Wildberries',
    order: 1,
    isPublished: true,
  },
  {
    title: 'Создание карточек товаров',
    description: 'Как создавать эффективные карточки товаров на Wildberries',
    order: 2,
    isPublished: true,
  },
  {
    title: 'Оптимизация продаж',
    description: 'Стратегии увеличения продаж на Wildberries',
    order: 3,
    isPublished: true,
  },
];

// Данные для уроков
const lessonsData = [
  {
    moduleId: 1,
    title: 'Что такое Wildberries',
    content: 'Wildberries — крупнейший онлайн-ритейлер в России и СНГ...',
    order: 1,
    isPublished: true,
  },
  {
    moduleId: 1,
    title: 'Регистрация поставщика',
    content: 'Пошаговая инструкция по регистрации поставщика на Wildberries...',
    order: 2,
    isPublished: true,
  },
  {
    moduleId: 2,
    title: 'Структура карточки товара',
    content: 'Из чего состоит карточка товара на Wildberries...',
    order: 1,
    isPublished: true,
  },
  {
    moduleId: 2,
    title: 'Оптимизация заголовков',
    content: 'Как создать привлекательные и эффективные заголовки...',
    order: 2,
    isPublished: true,
  },
  {
    moduleId: 3,
    title: 'Анализ конкурентов',
    content: 'Как анализировать конкурентов на Wildberries...',
    order: 1,
    isPublished: true,
  },
  {
    moduleId: 3,
    title: 'Стратегии ценообразования',
    content: 'Эффективные стратегии ценообразования для увеличения продаж...',
    order: 2,
    isPublished: true,
  },
];

// Функция для заполнения базы данных
const seedDatabase = async () => {
  try {
    // Проверяем подключение к базе данных
    await testDatabaseConnection();
    
    // Синхронизируем модели с базой данных (создаем таблицы)
    await sequelize.sync({ force: true });
    console.log('База данных синхронизирована');
    
    // Создаем администратора
    const admin = await User.create(adminData);
    console.log('Администратор создан:', admin.username);
    
    // Создаем модули
    const modules = await Module.bulkCreate(modulesData);
    console.log(`Создано ${modules.length} модулей`);
    
    // Создаем уроки
    const lessons = await Lesson.bulkCreate(lessonsData);
    console.log(`Создано ${lessons.length} уроков`);
    
    console.log('База данных успешно заполнена');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка заполнения базы данных:', error);
    process.exit(1);
  }
};

// Запускаем функцию заполнения базы данных
seedDatabase(); 