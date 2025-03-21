import { Router } from 'express';
import { ModuleController } from '../controllers/module.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();
const moduleController = new ModuleController();

/**
 * @route GET /api/modules
 * @desc Получение списка всех модулей
 * @access Публичный
 */
router.get('/', (_req, res) => {
  // В реальном приложении здесь был бы запрос к базе данных
  res.status(200).json({
    status: 'OK',
    data: {
      modules: [
        {
          id: 1,
          title: 'Введение в Wildberries',
          description: 'Базовые знания о работе с Wildberries',
          lessons: 5,
          duration: '2 часа',
          isAvailable: true,
          isPremium: false
        },
        {
          id: 2,
          title: 'Поиск товаров для продажи',
          description: 'Как найти прибыльную нишу на маркетплейсе',
          lessons: 8,
          duration: '4 часа',
          isAvailable: true,
          isPremium: true
        },
        {
          id: 3,
          title: 'Оптимизация карточек товаров',
          description: 'Как сделать карточку товара привлекательной для покупателей',
          lessons: 6,
          duration: '3 часа',
          isAvailable: true,
          isPremium: true
        }
      ]
    }
  });
});

/**
 * @route GET /api/modules/:id
 * @desc Получение информации о конкретном модуле
 * @access Публичный
 */
router.get('/:id', (req, res) => {
  const moduleId = parseInt(req.params.id);
  
  // Проверяем валидность параметра
  if (isNaN(moduleId)) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Неверный формат ID модуля'
    });
  }
  
  // Демо-данные о модуле
  if (moduleId === 1) {
    res.status(200).json({
      status: 'OK',
      data: {
        module: {
          id: 1,
          title: 'Введение в Wildberries',
          description: 'Базовые знания о работе с Wildberries',
          fullDescription: 'Полное описание модуля с информацией о всех уроках и материалах',
          lessonsCount: 5,
          duration: '2 часа',
          isAvailable: true,
          isPremium: false,
          lessonsList: [
            { id: 1, title: 'Что такое Wildberries', duration: '20 минут' },
            { id: 2, title: 'Регистрация поставщика', duration: '15 минут' },
            { id: 3, title: 'Основы личного кабинета', duration: '25 минут' },
            { id: 4, title: 'Создание первой карточки товара', duration: '30 минут' },
            { id: 5, title: 'Отправка товара на склад', duration: '30 минут' }
          ]
        }
      }
    });
  } else if (moduleId === 2) {
    res.status(200).json({
      status: 'OK',
      data: {
        module: {
          id: 2,
          title: 'Поиск товаров для продажи',
          description: 'Как найти прибыльную нишу на маркетплейсе',
          fullDescription: 'Детальное описание методов поиска прибыльных ниш и товаров на Wildberries',
          lessonsCount: 8,
          duration: '4 часа',
          isAvailable: true,
          isPremium: true,
          lessonsList: [
            { id: 6, title: 'Анализ спроса на маркетплейсе', duration: '30 минут' },
            { id: 7, title: 'Исследование конкурентов', duration: '30 минут' },
            { id: 8, title: 'Поиск поставщиков', duration: '35 минут' },
            { id: 9, title: 'Проверка качества товара', duration: '25 минут' },
            { id: 10, title: 'Расчет рентабельности', duration: '40 минут' },
            { id: 11, title: 'Заключение договоров с поставщиками', duration: '30 минут' },
            { id: 12, title: 'Логистика и хранение', duration: '25 минут' },
            { id: 13, title: 'Формирование цены', duration: '25 минут' }
          ]
        }
      }
    });
  } else {
    res.status(404).json({
      status: 'ERROR',
      message: 'Модуль не найден'
    });
  }
});

/**
 * @route GET /api/modules/:id/lessons
 * @desc Получение уроков модуля
 * @access Авторизованные пользователи (для премиум-модулей)
 */
router.get('/:id/lessons', authMiddleware, (req, res) => {
  const moduleId = parseInt(req.params.id);
  
  // Проверяем валидность параметра
  if (isNaN(moduleId)) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Неверный формат ID модуля'
    });
  }
  
  // Демо-данные об уроках
  if (moduleId === 1) {
    res.status(200).json({
      status: 'OK',
      data: {
        lessons: [
          { 
            id: 1, 
            title: 'Что такое Wildberries', 
            description: 'Обзор маркетплейса и его особенностей',
            duration: '20 минут',
            videoUrl: 'https://example.com/videos/wb-intro.mp4',
            materials: [
              { type: 'pdf', title: 'Конспект урока', url: 'https://example.com/materials/wb-intro.pdf' }
            ]
          },
          { 
            id: 2, 
            title: 'Регистрация поставщика', 
            description: 'Пошаговая инструкция по регистрации поставщика на Wildberries',
            duration: '15 минут',
            videoUrl: 'https://example.com/videos/wb-register.mp4',
            materials: [
              { type: 'pdf', title: 'Инструкция по регистрации', url: 'https://example.com/materials/wb-register.pdf' }
            ]
          },
          { 
            id: 3, 
            title: 'Основы личного кабинета', 
            description: 'Обзор возможностей личного кабинета поставщика',
            duration: '25 минут',
            videoUrl: 'https://example.com/videos/wb-cabinet.mp4',
            materials: [
              { type: 'pdf', title: 'Руководство по кабинету', url: 'https://example.com/materials/wb-cabinet.pdf' }
            ]
          },
          { 
            id: 4, 
            title: 'Создание первой карточки товара', 
            description: 'Как создать привлекательную карточку товара',
            duration: '30 минут',
            videoUrl: 'https://example.com/videos/wb-product-card.mp4',
            materials: [
              { type: 'pdf', title: 'Шаблон карточки товара', url: 'https://example.com/materials/wb-product-card.pdf' },
              { type: 'excel', title: 'Таблица характеристик', url: 'https://example.com/materials/wb-product-specs.xlsx' }
            ]
          },
          { 
            id: 5, 
            title: 'Отправка товара на склад', 
            description: 'Как правильно упаковать и отправить товар на склад Wildberries',
            duration: '30 минут',
            videoUrl: 'https://example.com/videos/wb-logistics.mp4',
            materials: [
              { type: 'pdf', title: 'Инструкция по упаковке', url: 'https://example.com/materials/wb-logistics.pdf' }
            ]
          }
        ]
      }
    });
  } else if (moduleId === 2) {
    // Проверяем премиум доступ
    if (!req.user || req.user.role !== 'premium') {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Для доступа к этому модулю требуется премиум-подписка'
      });
    }
    
    res.status(200).json({
      status: 'OK',
      data: {
        lessons: [
          { 
            id: 6, 
            title: 'Анализ спроса на маркетплейсе', 
            description: 'Как определить спрос на товары с помощью аналитических инструментов',
            duration: '30 минут',
            videoUrl: 'https://example.com/videos/wb-demand.mp4',
            materials: [
              { type: 'pdf', title: 'Аналитический отчет', url: 'https://example.com/materials/wb-demand.pdf' }
            ]
          },
          // ... и так далее для остальных уроков модуля
        ]
      }
    });
  } else {
    res.status(404).json({
      status: 'ERROR',
      message: 'Модуль не найден'
    });
  }
});

/**
 * @route POST /api/modules
 * @desc Создание нового модуля
 * @access Admin
 */
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  moduleController.createModule.bind(moduleController)
);

/**
 * @route PUT /api/modules/:id
 * @desc Обновление модуля
 * @access Admin
 */
router.put('/:id', 
  authMiddleware, 
  adminMiddleware, 
  moduleController.updateModule.bind(moduleController)
);

/**
 * @route DELETE /api/modules/:id
 * @desc Удаление модуля
 * @access Admin
 */
router.delete('/:id', 
  authMiddleware, 
  adminMiddleware, 
  moduleController.deleteModule.bind(moduleController)
);

export const moduleRoutes = router; 