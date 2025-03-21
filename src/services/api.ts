import axios from 'axios';

// Базовый URL API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Получение Telegram initData
const getTelegramInitData = () => {
  if (window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp.initData;
  }
  return '';
};

// Интерцептор для добавления токена авторизации и initData
api.interceptors.request.use(
  (config) => {
    // Добавляем токен авторизации
    const token = localStorage.getItem('wbsimple_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Добавляем Telegram initData для дополнительной проверки
    const initData = getTelegramInitData();
    if (initData) {
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
    // Если ошибка 401 (не авторизован), очищаем локальное хранилище и перенаправляем на главную
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('wbsimple_token');
      localStorage.removeItem('wbsimple_user');
      
      // Если мы не на главной, перенаправляем на нее
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      } else {
        // Если мы уже на главной, перезагружаем страницу для повторной авторизации
        window.location.reload();
      }
    }
    
    // Если ошибка 403 (доступ запрещен), показываем сообщение о необходимости подписки
    if (error.response && error.response.status === 403) {
      // Используем WebApp API, если он доступен
      if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.showAlert === 'function') {
        window.Telegram.WebApp.showAlert('Для доступа к этому разделу необходима подписка');
      } else {
        // Запасной вариант, если WebApp API недоступен
        alert('Для доступа к этому разделу необходима подписка');
      }
      
      // Если пользователь пытается получить доступ к защищенному контенту, перенаправляем на страницу подписки
      const isAccessingProtectedContent = window.location.pathname.includes('/lessons') || 
                                         window.location.pathname.includes('/modules');
      
      if (isAccessingProtectedContent) {
        window.location.href = '/subscription';
      }
    }
    
    return Promise.reject(error);
  }
);

// API для аутентификации
export const authAPI = {
  // Аутентификация через Telegram
  telegramAuth: (data: { initData: string, telegramUser: any }) => 
    api.post('/auth/telegram', data),
  
  // Получение данных текущего пользователя
  getCurrentUser: () => api.get('/auth/me'),
  
  // Обновление токена с использованием refresh токена
  refreshToken: (refreshToken: string) => 
    api.post('/auth/refresh-token', { refreshToken })
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
  createSubscription: (data: { plan: string, paymentMethod: string }) => 
    api.post('/subscriptions', data),
  
  // Отмена автопродления подписки
  cancelAutoRenewal: () => api.post('/subscriptions/cancel-auto-renewal'),
  
  // Включение автопродления подписки
  enableAutoRenewal: () => api.post('/subscriptions/enable-auto-renewal'),
  
  // Получение URL для оплаты через ЮКассу
  getPaymentUrl: (planId: string) => api.post('/subscriptions/payment-url', { planId }),
  
  // Проверка статуса платежа
  checkPaymentStatus: (paymentId: string) => api.get(`/subscriptions/payment-status/${paymentId}`)
};

// API для видео
export const videosAPI = {
  // Получение защищенного URL для видео
  getSecureVideoUrl: (videoId: string) => api.get(`/videos/secure-url/${videoId}`),
  
  // Отметка видео как просмотренного
  markVideoAsWatched: (videoId: string, progress: number, lessonId: string) => 
    api.post(`/videos/mark-watched/${videoId}`, { progress, lessonId }),
  
  // Получение прогресса просмотра видео
  getVideoProgress: (videoId: string) => api.get(`/videos/progress/${videoId}`)
};

export default api; 