import { createServer, Model, Response } from 'miragejs';

// Функция для генерации случайного ID
const generateId = () => Math.floor(Math.random() * 10000);

// Функция для генерации случайной даты в прошлом
const randomPastDate = (days = 365) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date.toISOString();
};

// Функция для генерации случайной даты в будущем
const randomFutureDate = (days = 365) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * days));
  return date.toISOString();
};

// Создаем моковый сервер
export function makeServer({ environment = 'development' } = {}) {
  let server = createServer({
    environment,

    models: {
      user: Model,
      module: Model,
      lesson: Model,
      media: Model,
    },

    seeds(server) {
      // Создаем пользователей
      server.create('user', {
        id: 1,
        telegramId: '123456789',
        username: 'user1',
        firstName: 'Иван',
        lastName: 'Иванов',
        photoUrl: 'https://via.placeholder.com/150',
        email: 'ivan@example.com',
        isAdmin: true,
        hasActiveSubscription: true,
        subscriptionEndDate: randomFutureDate(30),
        autoRenewal: true,
        progress: {
          completedLessons: [1, 2, 3],
          completedModules: [1],
        },
        createdAt: randomPastDate(60),
        updatedAt: randomPastDate(30),
      });

      server.create('user', {
        id: 2,
        telegramId: '987654321',
        username: 'user2',
        firstName: 'Петр',
        lastName: 'Петров',
        photoUrl: 'https://via.placeholder.com/150',
        email: 'petr@example.com',
        isAdmin: false,
        hasActiveSubscription: false,
        progress: {
          completedLessons: [1],
          completedModules: [],
        },
        createdAt: randomPastDate(45),
        updatedAt: randomPastDate(15),
      });

      // Создаем модули
      server.create('module', {
        id: 1,
        title: 'Введение в Wildberries',
        description: 'Базовые принципы работы с маркетплейсом Wildberries',
        order: 1,
        imageUrl: 'https://via.placeholder.com/300',
        lessonsCount: 3,
        createdAt: randomPastDate(90),
        updatedAt: randomPastDate(30),
      });

      server.create('module', {
        id: 2,
        title: 'Продвинутые техники продаж',
        description: 'Стратегии увеличения продаж на Wildberries',
        order: 2,
        imageUrl: 'https://via.placeholder.com/300',
        lessonsCount: 2,
        createdAt: randomPastDate(60),
        updatedAt: randomPastDate(15),
      });

      // Создаем уроки
      server.create('lesson', {
        id: 1,
        moduleId: 1,
        title: 'Регистрация на Wildberries',
        description: 'Как зарегистрироваться и начать работу с Wildberries',
        order: 1,
        videoUrl: 'https://example.com/video1.mp4',
        materialUrl: 'https://example.com/material1.pdf',
        createdAt: randomPastDate(90),
        updatedAt: randomPastDate(30),
      });

      server.create('lesson', {
        id: 2,
        moduleId: 1,
        title: 'Создание карточки товара',
        description: 'Как создать эффективную карточку товара',
        order: 2,
        videoUrl: 'https://example.com/video2.mp4',
        createdAt: randomPastDate(85),
        updatedAt: randomPastDate(25),
      });

      server.create('lesson', {
        id: 3,
        moduleId: 1,
        title: 'Оптимизация карточки товара',
        description: 'Как оптимизировать карточку товара для лучших продаж',
        order: 3,
        videoUrl: 'https://example.com/video3.mp4',
        materialUrl: 'https://example.com/material3.pdf',
        createdAt: randomPastDate(80),
        updatedAt: randomPastDate(20),
      });

      server.create('lesson', {
        id: 4,
        moduleId: 2,
        title: 'Анализ конкурентов',
        description: 'Как анализировать конкурентов на Wildberries',
        order: 1,
        videoUrl: 'https://example.com/video4.mp4',
        createdAt: randomPastDate(60),
        updatedAt: randomPastDate(15),
      });

      server.create('lesson', {
        id: 5,
        moduleId: 2,
        title: 'Стратегии ценообразования',
        description: 'Эффективные стратегии ценообразования на Wildberries',
        order: 2,
        videoUrl: 'https://example.com/video5.mp4',
        materialUrl: 'https://example.com/material5.pdf',
        createdAt: randomPastDate(55),
        updatedAt: randomPastDate(10),
      });

      // Создаем медиа-файлы
      server.create('media', {
        id: 1,
        filename: 'video1.mp4',
        originalName: 'Регистрация на Wildberries.mp4',
        mimeType: 'video/mp4',
        size: 15000000,
        url: 'https://example.com/video1.mp4',
        type: 'video',
        createdAt: randomPastDate(90),
        updatedAt: randomPastDate(30),
      });

      server.create('media', {
        id: 2,
        filename: 'material1.pdf',
        originalName: 'Инструкция по регистрации.pdf',
        mimeType: 'application/pdf',
        size: 2000000,
        url: 'https://example.com/material1.pdf',
        type: 'material',
        createdAt: randomPastDate(90),
        updatedAt: randomPastDate(30),
      });
    },

    routes() {
      this.namespace = 'api';

      // Аутентификация
      this.post('/admin/auth/login', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        
        if (attrs.username === 'admin' && attrs.password === 'admin') {
          return {
            token: 'mock-jwt-token',
            user: {
              id: 1,
              username: 'admin',
              isAdmin: true,
              firstName: 'Администратор',
              lastName: 'Системы',
              photoUrl: 'https://via.placeholder.com/150',
            },
          };
        } else {
          return new Response(401, {}, { message: 'Неверное имя пользователя или пароль' });
        }
      });

      this.get('/admin/auth/me', (schema) => {
        return schema.users.find(1);
      });

      // Модули
      this.get('/admin/modules', (schema) => {
        return schema.modules.all();
      });

      this.get('/admin/modules/:id', (schema, request) => {
        const id = request.params.id;
        return schema.modules.find(id);
      });

      this.post('/admin/modules', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        attrs.id = generateId();
        attrs.createdAt = new Date().toISOString();
        attrs.updatedAt = new Date().toISOString();
        attrs.lessonsCount = 0;
        
        return schema.modules.create(attrs);
      });

      this.put('/admin/modules/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        attrs.updatedAt = new Date().toISOString();
        
        const module = schema.modules.find(id);
        return module.update(attrs);
      });

      this.delete('/admin/modules/:id', (schema, request) => {
        const id = request.params.id;
        const module = schema.modules.find(id);
        module.destroy();
        
        return { success: true };
      });

      // Уроки
      this.get('/admin/modules/:moduleId/lessons', (schema, request) => {
        const moduleId = request.params.moduleId;
        return schema.lessons.where({ moduleId: Number(moduleId) });
      });

      this.get('/admin/lessons/:id', (schema, request) => {
        const id = request.params.id;
        return schema.lessons.find(id);
      });

      this.post('/admin/modules/:moduleId/lessons', (schema, request) => {
        const moduleId = request.params.moduleId;
        const attrs = JSON.parse(request.requestBody);
        attrs.id = generateId();
        attrs.moduleId = Number(moduleId);
        attrs.createdAt = new Date().toISOString();
        attrs.updatedAt = new Date().toISOString();
        
        // Увеличиваем счетчик уроков в модуле
        const module = schema.modules.find(moduleId);
        module.update({ 
          lessonsCount: (module.lessonsCount || 0) + 1,
          updatedAt: new Date().toISOString()
        });
        
        return schema.lessons.create(attrs);
      });

      this.put('/admin/lessons/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        attrs.updatedAt = new Date().toISOString();
        
        const lesson = schema.lessons.find(id);
        return lesson.update(attrs);
      });

      this.delete('/admin/lessons/:id', (schema, request) => {
        const id = request.params.id;
        const lesson = schema.lessons.find(id);
        const moduleId = lesson.moduleId;
        
        // Уменьшаем счетчик уроков в модуле
        const module = schema.modules.find(moduleId);
        module.update({ 
          lessonsCount: Math.max((module.lessonsCount || 0) - 1, 0),
          updatedAt: new Date().toISOString()
        });
        
        lesson.destroy();
        
        return { success: true };
      });

      // Медиа-файлы
      this.get('/admin/media', (schema) => {
        return schema.media.all();
      });

      this.post('/admin/upload/video', () => {
        const id = generateId();
        const now = new Date().toISOString();
        
        return {
          id,
          filename: `video${id}.mp4`,
          originalName: 'uploaded_video.mp4',
          mimeType: 'video/mp4',
          size: 10000000,
          url: `https://example.com/video${id}.mp4`,
          type: 'video',
          createdAt: now,
          updatedAt: now,
        };
      });

      this.post('/admin/upload/material', (schema, request) => {
        const id = generateId();
        const now = new Date().toISOString();
        const type = request.requestBody.get('type') || 'material';
        
        return {
          id,
          filename: `material${id}.pdf`,
          originalName: 'uploaded_material.pdf',
          mimeType: 'application/pdf',
          size: 1000000,
          url: `https://example.com/material${id}.pdf`,
          type,
          createdAt: now,
          updatedAt: now,
        };
      });

      this.delete('/admin/media/:id', (schema, request) => {
        const id = request.params.id;
        const media = schema.media.find(id);
        
        if (media) {
          media.destroy();
        }
        
        return { success: true };
      });

      // Пользователи
      this.get('/admin/users', (schema) => {
        return schema.users.all();
      });

      this.get('/admin/users/:id', (schema, request) => {
        const id = request.params.id;
        return schema.users.find(id);
      });

      this.put('/admin/users/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        attrs.updatedAt = new Date().toISOString();
        
        const user = schema.users.find(id);
        return user.update(attrs);
      });

      this.put('/admin/users/:id/subscription', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        attrs.updatedAt = new Date().toISOString();
        
        const user = schema.users.find(id);
        return user.update(attrs);
      });

      // Аналитика
      this.get('/admin/analytics', () => {
        return {
          totalUsers: 100,
          activeSubscriptions: 75,
          completedLessons: 350,
          userGrowth: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 10)
          })),
          subscriptionData: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            active: 75 + Math.floor(Math.random() * 10),
            expired: 25 + Math.floor(Math.random() * 5)
          })),
          moduleCompletionRates: [
            { moduleId: 1, moduleTitle: 'Введение в Wildberries', completionRate: 0.85 },
            { moduleId: 2, moduleTitle: 'Продвинутые техники продаж', completionRate: 0.65 }
          ]
        };
      });

      this.get('/admin/analytics/user-growth', (schema, request) => {
        const period = request.queryParams.period || 'month';
        let days;
        
        switch (period) {
          case 'week':
            days = 7;
            break;
          case 'year':
            days = 365;
            break;
          case 'month':
          default:
            days = 30;
            break;
        }
        
        return Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10)
        }));
      });

      this.get('/admin/analytics/subscriptions', (schema, request) => {
        const period = request.queryParams.period || 'month';
        let days;
        
        switch (period) {
          case 'week':
            days = 7;
            break;
          case 'year':
            days = 365;
            break;
          case 'month':
          default:
            days = 30;
            break;
        }
        
        return Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          active: 75 + Math.floor(Math.random() * 10),
          expired: 25 + Math.floor(Math.random() * 5)
        }));
      });

      this.get('/admin/analytics/module-completion', () => {
        return [
          { moduleId: 1, moduleTitle: 'Введение в Wildberries', completionRate: 0.85 },
          { moduleId: 2, moduleTitle: 'Продвинутые техники продаж', completionRate: 0.65 }
        ];
      });

      this.get('/admin/analytics/lesson-completion', (schema, request) => {
        const moduleId = request.queryParams.moduleId;
        
        if (moduleId === '1') {
          return [
            { lessonId: 1, lessonTitle: 'Регистрация на Wildberries', completionRate: 0.95 },
            { lessonId: 2, lessonTitle: 'Создание карточки товара', completionRate: 0.85 },
            { lessonId: 3, lessonTitle: 'Оптимизация карточки товара', completionRate: 0.75 }
          ];
        } else if (moduleId === '2') {
          return [
            { lessonId: 4, lessonTitle: 'Анализ конкурентов', completionRate: 0.70 },
            { lessonId: 5, lessonTitle: 'Стратегии ценообразования', completionRate: 0.60 }
          ];
        } else {
          return [
            { lessonId: 1, lessonTitle: 'Регистрация на Wildberries', completionRate: 0.95 },
            { lessonId: 2, lessonTitle: 'Создание карточки товара', completionRate: 0.85 },
            { lessonId: 3, lessonTitle: 'Оптимизация карточки товара', completionRate: 0.75 },
            { lessonId: 4, lessonTitle: 'Анализ конкурентов', completionRate: 0.70 },
            { lessonId: 5, lessonTitle: 'Стратегии ценообразования', completionRate: 0.60 }
          ];
        }
      });
    },
  });

  return server;
} 