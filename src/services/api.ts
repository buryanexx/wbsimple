import axios from 'axios';

// Базовый URL API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const initData = localStorage.getItem('telegram_init_data');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (initData && !config.headers['X-Telegram-Init-Data']) {
      config.headers['X-Telegram-Init-Data'] = initData;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если ошибка 401 (Unauthorized), очищаем токен и перенаправляем на главную
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API для аутентификации
export const authAPI = {
  // Аутентификация через Telegram
  telegramAuth: (data: { initData: string, telegramUser: any }) => api.post('/auth/telegram', data),
  
  // Получение данных текущего пользователя
  getCurrentUser: (initData?: string) => api.get('/auth/me', {
    headers: initData ? { 'X-Telegram-Init-Data': initData } : undefined
  })
};

// API для модулей
export const modulesAPI = {
  // Получение всех модулей
  getAllModules: () => api.get('/modules'),
  
  // Получение модуля по ID
  getModuleById: (moduleId: number) => api.get(`/modules/${moduleId}`),
  
  // Отметка модуля как завершенного
  completeModule: (moduleId: number) => api.post(`/modules/${moduleId}/complete`)
};

// API для уроков
export const lessonsAPI = {
  // Получение всех уроков модуля
  getLessonsByModuleId: (moduleId: number) => api.get(`/lessons/module/${moduleId}`),
  
  // Получение урока по ID
  getLessonById: (moduleId: number, lessonId: number) => api.get(`/lessons/${moduleId}/${lessonId}`),
  
  // Отметка урока как завершенного
  completeLesson: (moduleId: number, lessonId: number) => api.post(`/lessons/${moduleId}/${lessonId}/complete`)
};

// API для шаблонов
export const templatesAPI = {
  // Получение всех шаблонов
  getAllTemplates: (category?: string) => api.get('/templates', { params: { category } }),
  
  // Получение категорий шаблонов
  getTemplateCategories: () => api.get('/templates/categories'),
  
  // Получение шаблона по ID
  getTemplateById: (templateId: number) => api.get(`/templates/${templateId}`),
  
  // Скачивание шаблона
  downloadTemplate: (templateId: number) => api.get(`/templates/${templateId}/download`)
};

// API для подписок
export const subscriptionsAPI = {
  // Получение информации о подписке пользователя
  getSubscriptionInfo: () => api.get('/subscriptions/info'),
  
  // Создание новой подписки
  createSubscription: () => api.post('/subscriptions'),
  
  // Отмена автопродления подписки
  cancelAutoRenewal: () => api.post('/subscriptions/cancel-auto-renewal'),
  
  // Включение автопродления подписки
  enableAutoRenewal: () => api.post('/subscriptions/enable-auto-renewal')
};

// API для видео
export const videosAPI = {
  // Получение защищенного URL для видео
  getSecureVideoUrl: (videoId: string) => api.get(`/videos/${videoId}/secure-url`),
  
  // Отметка видео как просмотренного
  markVideoAsWatched: (videoId: string, progress: number) => api.post(`/videos/${videoId}/watched`, { progress }),
  
  // Получение прогресса просмотра видео
  getVideoProgress: (videoId: string) => api.get(`/videos/${videoId}/progress`)
};

export default {
  authAPI,
  modulesAPI,
  lessonsAPI,
  templatesAPI,
  subscriptionsAPI,
  videosAPI
}; 