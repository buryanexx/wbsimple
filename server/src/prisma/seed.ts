import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

/**
 * Функция для заполнения базы данных тестовыми данными
 */
async function main() {
  console.log('Начало заполнения базы данных...');
  
  // Создаем администратора
  const admin = await prisma.user.upsert({
    where: { telegramId: '12345678' },
    update: {},
    create: {
      telegramId: '12345678',
      username: 'admin',
      firstName: 'Админ',
      lastName: 'Системы',
      photoUrl: 'https://via.placeholder.com/150',
      role: 'ADMIN',
      progress: {
        create: {
          completedModules: [],
          lastActivity: new Date()
        }
      }
    }
  });
  
  console.log('Создан администратор:', admin.username);
  
  // Создаем тестового пользователя
  const user = await prisma.user.upsert({
    where: { telegramId: '87654321' },
    update: {},
    create: {
      telegramId: '87654321',
      username: 'testuser',
      firstName: 'Тестовый',
      lastName: 'Пользователь',
      photoUrl: 'https://via.placeholder.com/150',
      role: 'USER',
      progress: {
        create: {
          completedModules: [],
          lastActivity: new Date()
        }
      }
    }
  });
  
  console.log('Создан тестовый пользователь:', user.username);
  
  // Создаем образовательные модули
  const module1 = await prisma.module.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'Введение в Wildberries',
      description: 'Базовые принципы работы с маркетплейсом Wildberries',
      order: 1,
      imageUrl: 'https://via.placeholder.com/300x200?text=Module+1',
      isPublished: true
    }
  });
  
  const module2 = await prisma.module.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      title: 'Создание карточек товаров',
      description: 'Эффективное создание и оптимизация карточек товаров на Wildberries',
      order: 2,
      imageUrl: 'https://via.placeholder.com/300x200?text=Module+2',
      isPublished: true
    }
  });
  
  const module3 = await prisma.module.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      title: 'Продвижение и реклама',
      description: 'Способы продвижения товаров и рекламные инструменты Wildberries',
      order: 3,
      imageUrl: 'https://via.placeholder.com/300x200?text=Module+3',
      isPublished: false
    }
  });
  
  console.log('Создано модулей:', 3);
  
  // Создаем уроки для модулей
  // Уроки для модуля 1
  const lesson1_1 = await prisma.lesson.upsert({
    where: { id: '1_1' },
    update: {},
    create: {
      id: '1_1',
      title: 'Что такое Wildberries',
      description: 'Обзор маркетплейса и его основные особенности',
      content: 'Содержимое урока о Wildberries и его особенностях...',
      videoUrl: 'video1_1.mp4',
      duration: 1200, // 20 минут
      order: 1,
      moduleId: module1.id,
      type: 'VIDEO',
      isPublished: true
    }
  });
  
  const lesson1_2 = await prisma.lesson.upsert({
    where: { id: '1_2' },
    update: {},
    create: {
      id: '1_2',
      title: 'Регистрация поставщика',
      description: 'Пошаговая инструкция по регистрации поставщика на Wildberries',
      content: 'Содержимое урока о регистрации поставщика...',
      videoUrl: 'video1_2.mp4',
      duration: 900, // 15 минут
      order: 2,
      moduleId: module1.id,
      type: 'VIDEO',
      isPublished: true
    }
  });
  
  // Уроки для модуля 2
  const lesson2_1 = await prisma.lesson.upsert({
    where: { id: '2_1' },
    update: {},
    create: {
      id: '2_1',
      title: 'Структура карточки товара',
      description: 'Из каких элементов состоит карточка товара и на что влияет каждый элемент',
      content: 'Содержимое урока о структуре карточки товара...',
      videoUrl: 'video2_1.mp4',
      duration: 1500, // 25 минут
      order: 1,
      moduleId: module2.id,
      type: 'VIDEO',
      isPublished: true
    }
  });
  
  const lesson2_2 = await prisma.lesson.upsert({
    where: { id: '2_2' },
    update: {},
    create: {
      id: '2_2',
      title: 'SEO-оптимизация карточек',
      description: 'Как правильно оптимизировать карточки товаров для поиска',
      content: 'Содержимое урока об оптимизации карточек...',
      videoUrl: 'video2_2.mp4',
      duration: 1800, // 30 минут
      order: 2,
      moduleId: module2.id,
      type: 'VIDEO',
      isPublished: true
    }
  });
  
  // Уроки для модуля 3
  const lesson3_1 = await prisma.lesson.upsert({
    where: { id: '3_1' },
    update: {},
    create: {
      id: '3_1',
      title: 'Рекламный кабинет Wildberries',
      description: 'Обзор рекламного кабинета и его инструментов',
      content: 'Содержимое урока о рекламном кабинете...',
      videoUrl: 'video3_1.mp4',
      duration: 1200, // 20 минут
      order: 1,
      moduleId: module3.id,
      type: 'VIDEO',
      isPublished: false
    }
  });
  
  console.log('Создано уроков:', 5);
  
  // Добавляем отзывы
  const feedback1 = await prisma.feedback.upsert({
    where: { id: 'feedback1' },
    update: {},
    create: {
      id: 'feedback1',
      rating: 5,
      comment: 'Отличный курс! Очень полезная информация.',
      userId: user.id,
      moduleId: module1.id
    }
  });
  
  const feedback2 = await prisma.feedback.upsert({
    where: { id: 'feedback2' },
    update: {},
    create: {
      id: 'feedback2',
      rating: 4,
      comment: 'Хороший урок, но можно было рассказать подробнее',
      userId: user.id,
      lessonId: lesson1_2.id
    }
  });
  
  console.log('Создано отзывов:', 2);
  
  console.log('База данных успешно заполнена тестовыми данными!');
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 