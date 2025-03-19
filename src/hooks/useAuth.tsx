import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

// Конфигурация для авторизации
const AUTH_CONFIG = {
  storageTokenKey: 'wbsimple_token',
  storageUserKey: 'wbsimple_user',
  apiUrl: process.env.REACT_APP_API_URL || 'https://api.wbsimple.ru/api'
};

// Интерфейс для пользователя
export interface User {
  id: number;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  subscriptionEndDate?: string;
  token: string;
  progress?: {
    completedLessons: number[];
    completedModules: number[];
  };
}

// Интерфейс для контекста аутентификации
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (telegramId: number) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер аутентификации
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webApp = useWebApp();
  
  // Хелперы для работы с Telegram
  const telegramHelpers = {
    isRunningInTelegram: () => {
      // Проверяем наличие объекта Telegram и его свойств
      const isTelegramAvailable = typeof window !== 'undefined' && 
        window.Telegram && 
        window.Telegram.WebApp;
      
      if (isTelegramAvailable) {
        console.log('Telegram WebApp доступен:', window.Telegram.WebApp);
        return true;
      }
      
      // Дополнительная проверка на параметры URL
      const url = window.location.href;
      if (url.includes('tgWebAppData=') || url.includes('tgWebAppVersion=')) {
        console.log('Обнаружены параметры Telegram WebApp в URL');
        return true;
      }
      
      console.log('Telegram WebApp не обнаружен');
      return false;
    },
    
    getTelegramUser: () => {
      if (!telegramHelpers.isRunningInTelegram()) return null;
      
      try {
        // Пытаемся получить данные пользователя
        const webAppUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        console.log('Данные пользователя Telegram:', webAppUser);
        return webAppUser || null;
      } catch (error) {
        console.error('Ошибка при получении данных пользователя Telegram:', error);
        return null;
      }
    },
    
    getInitData: () => {
      if (!telegramHelpers.isRunningInTelegram()) return '';
      
      try {
        return window.Telegram?.WebApp?.initData || '';
      } catch (error) {
        console.error('Ошибка при получении initData:', error);
        return '';
      }
    },
    
    showAlert: (message: string) => {
      try {
        if (telegramHelpers.isRunningInTelegram() && window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert(message);
        } else {
          alert(message);
        }
      } catch (error) {
        console.error('Ошибка при показе уведомления:', error);
        alert(message);
      }
    }
  };

  // Проверка аутентификации при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Начинаем проверку аутентификации');
        // Проверка, запущено ли приложение в Telegram
        const isInTelegram = telegramHelpers.isRunningInTelegram();
        console.log('Приложение запущено в Telegram:', isInTelegram);
        
        // Проверяем сохраненный токен и пользователя
        const savedToken = localStorage.getItem(AUTH_CONFIG.storageTokenKey);
        const savedUser = localStorage.getItem(AUTH_CONFIG.storageUserKey);
        console.log('Сохраненные данные:', { token: !!savedToken, user: !!savedUser });
        
        if (savedToken && savedUser) {
          try {
            // В реальном проекте здесь будет запрос к API для проверки валидности токена
            console.log('Используем сохраненного пользователя');
            setUser(JSON.parse(savedUser));
            setError(null);
          } catch (error) {
            console.error('Ошибка при проверке токена:', error);
            // Если произошла ошибка, пробуем выполнить автоматическую авторизацию
            console.log('Пытаемся выполнить автоматическую авторизацию');
            await tryTelegramAuth();
          }
        } else {
          // Если нет сохраненных данных, пробуем выполнить автоматическую авторизацию
          console.log('Нет сохраненных данных, пытаемся выполнить автоматическую авторизацию');
          await tryTelegramAuth();
        }
      } catch (error) {
        console.error('Ошибка при проверке аутентификации:', error);
        setError('Ошибка при проверке аутентификации');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [webApp]);
  
  // Попытка автоматической авторизации через Telegram
  const tryTelegramAuth = async () => {
    console.log('Пытаемся выполнить автоматическую авторизацию через Telegram');
    
    // Принудительное создание пользователя для отладки
    const createDemoUser = () => {
      const demoUser: User = {
        id: Math.floor(Math.random() * 1000000),
        telegramId: Math.floor(Math.random() * 1000000),
        firstName: 'Демо',
        lastName: 'Пользователь',
        username: 'demo_user',
        isAdmin: false,
        hasActiveSubscription: true, // Для тестирования включаем подписку
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней
        token: 'demo_token_' + Math.random().toString(36).substring(7),
        progress: {
          completedLessons: [1, 2],
          completedModules: []
        }
      };
      
      // Сохраняем данные пользователя и токен
      localStorage.setItem(AUTH_CONFIG.storageUserKey, JSON.stringify(demoUser));
      localStorage.setItem(AUTH_CONFIG.storageTokenKey, demoUser.token);
      
      // Устанавливаем пользователя в состояние
      setUser(demoUser);
      setError(null);
      console.log('Создан демо-пользователь для тестирования');
      return demoUser;
    };
    
    if (!telegramHelpers.isRunningInTelegram()) {
      console.log('Приложение не запущено в Telegram WebApp, создаем демо-пользователя');
      createDemoUser();
      setLoading(false);
      return;
    }
    
    const tgUser = telegramHelpers.getTelegramUser();
    if (!tgUser) {
      console.log('Нет данных пользователя в Telegram WebApp, создаем демо-пользователя');
      createDemoUser();
      setLoading(false);
      return;
    }
    
    try {
      console.log('Данные пользователя из Telegram получены:', tgUser);
      
      // Получаем initData для валидации на сервере (в реальном приложении)
      const initData = telegramHelpers.getInitData();
      console.log('initData получена:', !!initData);
      
      if (!initData) {
        console.warn('initData недоступна, но продолжаем авторизацию с данными пользователя');
      }
      
      // В реальном проекте здесь будет запрос к API для аутентификации
      // const response = await fetch(`${AUTH_CONFIG.apiUrl}/auth/telegram`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ initData })
      // });
      
      // if (response.ok) {
      //   const data = await response.json();
        
      // В демо-режиме создаем пользователя на основе данных из WebApp
      const authenticatedUser: User = {
        id: tgUser.id,
        telegramId: tgUser.id,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        photoUrl: tgUser.photo_url,
        isAdmin: false,
        hasActiveSubscription: true, // Для демо включаем подписку
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней
        token: 'demo_token_' + Math.random().toString(36).substring(7),
        progress: {
          completedLessons: [1, 2, 3, 4], // Добавляем прогресс для демонстрации
          completedModules: [1]
        }
      };
        
      // Сохраняем данные пользователя и токен
      localStorage.setItem(AUTH_CONFIG.storageUserKey, JSON.stringify(authenticatedUser));
      localStorage.setItem(AUTH_CONFIG.storageTokenKey, authenticatedUser.token);
      
      // Устанавливаем пользователя в состояние
      setUser(authenticatedUser);
      setError(null);
      
      console.log('Пользователь успешно аутентифицирован через Telegram:', authenticatedUser);
      // } else {
      //   const errorData = await response.json();
      //   console.error('Ошибка авторизации через Telegram:', errorData);
      //   setError(errorData.message || 'Ошибка авторизации через Telegram');
      // }
    } catch (error) {
      console.error('Ошибка при авторизации через Telegram:', error);
      setError('Ошибка при авторизации через Telegram');
      // В случае ошибки создаем демо-пользователя
      createDemoUser();
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для входа (для тестирования и отладки)
  const login = async (telegramId: number) => {
    setLoading(true);
    
    try {
      // В реальном проекте здесь будет запрос к API
      // const response = await fetch(`${AUTH_CONFIG.apiUrl}/auth/login`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ telegramId })
      // });
      
      // if (response.ok) {
      //   const data = await response.json();
        
        // Временная имитация ответа от сервера
        const mockUser: User = {
          id: telegramId,
          telegramId: telegramId,
          firstName: 'Пользователь',
          lastName: telegramId.toString(),
          isAdmin: false,
          hasActiveSubscription: false,
          token: `token_${telegramId}`,
          progress: {
            completedLessons: [],
            completedModules: []
          }
        };
        
        // Сохраняем данные пользователя и токен
        localStorage.setItem(AUTH_CONFIG.storageUserKey, JSON.stringify(mockUser));
        localStorage.setItem(AUTH_CONFIG.storageTokenKey, mockUser.token);
        
        // Устанавливаем пользователя в состояние
        setUser(mockUser);
        setError(null);
      // } else {
      //   const errorData = await response.json();
      //   setError(errorData.message || 'Ошибка входа');
      // }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setError('Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для выхода
  const logout = () => {
    // Удаляем данные из localStorage
    localStorage.removeItem(AUTH_CONFIG.storageUserKey);
    localStorage.removeItem(AUTH_CONFIG.storageTokenKey);
    
    // Сбрасываем состояние пользователя
    setUser(null);
    setError(null);
  };
  
  // Функция для обновления данных пользователя
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Обновляем данные в localStorage
    localStorage.setItem(AUTH_CONFIG.storageUserKey, JSON.stringify(updatedUser));
    
    // В реальном проекте здесь также будет запрос к API для обновления данных на сервере
    // fetch(`${AUTH_CONFIG.apiUrl}/users/${user.id}`, {
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${user.token}`
    //   },
    //   body: JSON.stringify(userData)
    // });
  };
  
  // Значение контекста
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  
  return context;
};

// Экспортируем функцию для проверки, запущено ли приложение в Telegram
export const isRunningInTelegram = () => {
  return !!window.Telegram && !!window.Telegram.WebApp;
}; 