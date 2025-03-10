import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Template from '../models/Template.js';

dotenv.config();

// Подключение к базе данных
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wbsimple';
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB подключена успешно');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Тестовые данные для модулей
const modulesData = [
  {
    moduleId: 1,
    title: 'Регистрация на Wildberries',
    description: 'Как правильно зарегистрироваться на маркетплейсе и настроить личный кабинет',
    icon: '📝',
    order: 1,
    isPremium: false,
    lessonsCount: 2
  },
  {
    moduleId: 2,
    title: 'Выбор ниши и товара',
    description: 'Анализ рынка и выбор прибыльной ниши для старта',
    icon: '🔍',
    order: 2,
    isPremium: false,
    lessonsCount: 1
  },
  {
    moduleId: 3,
    title: 'Поиск поставщиков',
    description: 'Где и как найти надежных поставщиков для вашего бизнеса',
    icon: '🤝',
    order: 3,
    isPremium: true,
    lessonsCount: 0
  },
  {
    moduleId: 4,
    title: 'Создание карточек товаров',
    description: 'Как создать продающие карточки товаров на Wildberries',
    icon: '📊',
    order: 4,
    isPremium: true,
    lessonsCount: 0
  }
];

// Тестовые данные для уроков
const lessonsData = [
  {
    lessonId: 1,
    moduleId: 1,
    title: 'Введение в Wildberries',
    description: 'Обзор маркетплейса Wildberries и его преимущества',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '10:25',
    order: 1,
    materials: [
      {
        name: 'Презентация "Введение в Wildberries"',
        url: 'https://example.com/presentation.pdf',
        type: 'pdf'
      },
      {
        name: 'Чек-лист для начинающих',
        url: 'https://example.com/checklist.pdf',
        type: 'pdf'
      }
    ],
    quiz: [
      {
        question: 'Какой год основания Wildberries?',
        options: ['2000', '2004', '2010', '2015'],
        correctAnswer: 1
      }
    ]
  },
  {
    lessonId: 2,
    moduleId: 1,
    title: 'Регистрация личного кабинета',
    description: 'Пошаговая инструкция по регистрации на Wildberries',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '15:30',
    order: 2,
    materials: [
      {
        name: 'Инструкция по регистрации',
        url: 'https://example.com/registration.pdf',
        type: 'pdf'
      }
    ],
    quiz: [
      {
        question: 'Какой документ необходим для регистрации на Wildberries?',
        options: ['Паспорт', 'ИНН', 'СНИЛС', 'Все вышеперечисленное'],
        correctAnswer: 3
      }
    ]
  },
  {
    lessonId: 1,
    moduleId: 2,
    title: 'Анализ рынка Wildberries',
    description: 'Как анализировать рынок и находить прибыльные ниши',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '20:15',
    order: 1,
    materials: [
      {
        name: 'Таблица для анализа ниши',
        url: 'https://example.com/analysis.xlsx',
        type: 'xlsx'
      },
      {
        name: 'Список популярных категорий',
        url: 'https://example.com/categories.pdf',
        type: 'pdf'
      }
    ],
    quiz: [
      {
        question: 'Какой показатель важнее всего при выборе ниши?',
        options: ['Количество продаж', 'Цена товара', 'Маржинальность', 'Конкуренция'],
        correctAnswer: 2
      }
    ]
  }
];

// Тестовые данные для шаблонов
const templatesData = [
  {
    templateId: 1,
    title: 'Шаблон карточки товара',
    description: 'Базовый шаблон для создания продающей карточки товара на Wildberries',
    category: 'Карточки товаров',
    downloadUrl: 'https://example.com/template1.pdf',
    isPremium: false,
    popularity: 85,
    downloads: 120
  },
  {
    templateId: 2,
    title: 'Скрипт для переговоров с поставщиками',
    description: 'Готовый скрипт для ведения переговоров с поставщиками и получения лучших условий',
    category: 'Скрипты',
    downloadUrl: 'https://example.com/template2.pdf',
    isPremium: true,
    popularity: 92,
    downloads: 75
  },
  {
    templateId: 3,
    title: 'Таблица для расчета маржинальности',
    description: 'Excel-таблица для расчета маржинальности товаров с учетом всех комиссий Wildberries',
    category: 'Таблицы',
    downloadUrl: 'https://example.com/template3.xlsx',
    isPremium: true,
    popularity: 78,
    downloads: 60
  }
];

// Функция для заполнения базы данных
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Очистка коллекций
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Template.deleteMany({});
    
    // Заполнение коллекций
    await Module.insertMany(modulesData);
    await Lesson.insertMany(lessonsData);
    await Template.insertMany(templatesData);
    
    console.log('База данных успешно заполнена тестовыми данными');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка заполнения базы данных:', error);
    process.exit(1);
  }
};

// Запуск функции заполнения базы данных
seedDatabase(); 