import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Template from '../models/Template.js';
import { connectDB } from '../config/database.js';

// Загрузка переменных окружения
dotenv.config();

// Данные для модулей
const modules = [
  {
    title: 'Введение в Wildberries',
    description: 'Основы работы с маркетплейсом Wildberries',
    order: 1,
    imageUrl: 'https://example.com/module1.jpg',
  },
  {
    title: 'Регистрация и настройка кабинета',
    description: 'Пошаговая инструкция по регистрации и настройке личного кабинета продавца',
    order: 2,
    imageUrl: 'https://example.com/module2.jpg',
  },
  {
    title: 'Выбор ниши и товаров',
    description: 'Как выбрать прибыльную нишу и товары для продажи',
    order: 3,
    imageUrl: 'https://example.com/module3.jpg',
  },
  {
    title: 'Работа с поставщиками',
    description: 'Поиск надежных поставщиков и построение отношений',
    order: 4,
    imageUrl: 'https://example.com/module4.jpg',
  },
  {
    title: 'Создание карточек товаров',
    description: 'Оптимизация карточек товаров для повышения продаж',
    order: 5,
    imageUrl: 'https://example.com/module5.jpg',
  },
  {
    title: 'Реклама и продвижение',
    description: 'Стратегии рекламы и продвижения товаров на Wildberries',
    order: 6,
    imageUrl: 'https://example.com/module6.jpg',
  },
  {
    title: 'Аналитика и оптимизация',
    description: 'Анализ продаж и оптимизация бизнес-процессов',
    order: 7,
    imageUrl: 'https://example.com/module7.jpg',
  },
  {
    title: 'Масштабирование бизнеса',
    description: 'Стратегии масштабирования бизнеса на Wildberries',
    order: 8,
    imageUrl: 'https://example.com/module8.jpg',
  },
];

// Данные для уроков
const lessons = [
  // Модуль 1
  {
    title: 'Что такое Wildberries',
    description: 'Обзор маркетплейса Wildberries и его особенностей',
    moduleId: '',
    order: 1,
    videoUrl: 'https://example.com/lesson1.mp4',
    content: 'Содержание урока о Wildberries...',
    duration: 15,
  },
  {
    title: 'Преимущества работы с Wildberries',
    description: 'Почему стоит выбрать Wildberries для продажи товаров',
    moduleId: '',
    order: 2,
    videoUrl: 'https://example.com/lesson2.mp4',
    content: 'Содержание урока о преимуществах...',
    duration: 20,
  },
  // Добавьте больше уроков по необходимости
];

// Данные для шаблонов
const templates = [
  {
    title: 'Шаблон карточки товара',
    description: 'Оптимизированный шаблон для создания карточки товара',
    category: 'Карточки товаров',
    fileUrl: 'https://example.com/template1.docx',
    imageUrl: 'https://example.com/template1.jpg',
  },
  {
    title: 'Скрипт для общения с поставщиками',
    description: 'Готовый скрипт для переговоров с поставщиками',
    category: 'Скрипты',
    fileUrl: 'https://example.com/template2.docx',
    imageUrl: 'https://example.com/template2.jpg',
  },
  // Добавьте больше шаблонов по необходимости
];

// Функция для заполнения базы данных
const seedDatabase = async () => {
  try {
    // Подключение к базе данных
    await connectDB();

    // Очистка коллекций
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Template.deleteMany({});

    console.log('Коллекции очищены');

    // Добавление модулей
    const createdModules = await Module.insertMany(modules);
    console.log(`Добавлено ${createdModules.length} модулей`);

    // Добавление уроков с привязкой к модулям
    const lessonsWithModuleIds = lessons.map((lesson, index) => {
      // Привязываем уроки к первому модулю (для примера)
      return {
        ...lesson,
        moduleId: createdModules[0]._id,
      };
    });

    const createdLessons = await Lesson.insertMany(lessonsWithModuleIds);
    console.log(`Добавлено ${createdLessons.length} уроков`);

    // Добавление шаблонов
    const createdTemplates = await Template.insertMany(templates);
    console.log(`Добавлено ${createdTemplates.length} шаблонов`);

    console.log('База данных успешно заполнена');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка заполнения базы данных:', error);
    process.exit(1);
  }
};

// Запуск функции заполнения базы данных
seedDatabase(); 