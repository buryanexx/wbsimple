import User from './User.js';
import Module from './Module.js';
import Lesson from './Lesson.js';
import UserProgress from './UserProgress.js';
import Subscription from './Subscription.js';
import VideoProgress from './VideoProgress.js';
import sequelize from '../config/database.js';

// Определение ассоциаций между моделями
Module.hasMany(Lesson, {
  foreignKey: 'moduleId',
  as: 'lessons',
});

Lesson.belongsTo(Module, {
  foreignKey: 'moduleId',
  as: 'module',
});

User.hasMany(UserProgress, {
  foreignKey: 'userId',
  as: 'userProgresses',
});

UserProgress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Lesson.hasMany(UserProgress, {
  foreignKey: 'lessonId',
  as: 'userProgress',
});

UserProgress.belongsTo(Lesson, {
  foreignKey: 'lessonId',
  as: 'lesson',
});

Module.hasMany(UserProgress, {
  foreignKey: 'moduleId',
  as: 'userProgress',
});

UserProgress.belongsTo(Module, {
  foreignKey: 'moduleId',
  as: 'module',
});

User.hasMany(Subscription, {
  foreignKey: 'userId',
  as: 'subscriptions',
});

Subscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Ассоциации для VideoProgress
User.hasMany(VideoProgress, {
  foreignKey: 'userId',
  as: 'videoProgress',
});

VideoProgress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Функция для синхронизации моделей с базой данных
export const syncModels = async (): Promise<void> => {
  try {
    // В продакшене лучше использовать миграции вместо sync
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Модели синхронизированы с базой данных');
    }
  } catch (error) {
    console.error('Ошибка синхронизации моделей:', error);
    throw error;
  }
};

export {
  User,
  Module,
  Lesson,
  UserProgress,
  Subscription,
  VideoProgress,
  sequelize,
}; 