import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import { API_URL, AUTH_CONFIG, telegramHelpers } from '../config';

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
  // Создаем тестового пользователя для демонстрации
  const testUser: User = {
    id: 1,
    telegramId: 123456789,
    firstName: 'Тестовый',
    lastName: 'Пользователь',
    username: 'test_user',
    isAdmin: false,
    hasActiveSubscription: true,
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    token: 'test_token',
    progress: {
      completedLessons: [1, 2, 3],
      completedModules: [1]
    }
  };
  
  const [user, setUser] = useState<User | null>(testUser); // Используем тестового пользователя
  const [loading, setLoading] = useState(false); // Уменьшаем время загрузки
  const [error, setError] = useState<string | null>(null);
  const webApp = useWebApp();

  // Проверка аутентификации при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем сохраненный токен
        const savedToken = localStorage.getItem(AUTH_CONFIG.storageTokenKey);
        const savedUser = localStorage.getItem(AUTH_CONFIG.storageUserKey);
        
        if (savedToken && savedUser) {
          // Проверяем токен
          const response = await fetch(`${API_URL}/auth/check`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${savedToken}`
            }
          });
          
          if (response.ok) {
            // Если токен валидный, устанавливаем пользователя из localStorage
            setUser(JSON.parse(savedUser));
          } else {
            // Если токен невалидный, пробуем выполнить автоматический вход через Telegram
            await tryTelegramAuth();
          }
        } else {
          // Если нет токена, пробуем выполнить автоматический вход через Telegram
          await tryTelegramAuth();
        }
      } catch (err) {
        console.error('Ошибка при проверке аутентификации:', err);
        setError('Ошибка при проверке аутентификации');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [webApp]);
  
  // Попытка авторизации через Telegram WebApp
  const tryTelegramAuth = async () => {
    if (!telegramHelpers.isRunningInTelegram()) {
      console.log('Не запущено в Telegram WebApp, авторизацию нужно выполнить вручную');
      return;
    }
    
    try {
      const tgUser = telegramHelpers.getTelegramUser();
      
      if (!tgUser) {
        console.log('Нет данных пользователя в Telegram WebApp');
        return;
      }
      
      // Получаем данные initData для проверки на сервере
      const initData = telegramHelpers.getInitData();
      
      // Отправляем запрос на авторизацию с использованием initData
      const response = await fetch(`${API_URL}/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Логируем для отладки
        console.log('Успешная аутентификация через Telegram:', data);
        
        // Создаем объект пользователя из данных API
        const authenticatedUser: User = {
          id: data.user.id,
          telegramId: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          photoUrl: tgUser.photo_url,
          isAdmin: data.user.isAdmin || false,
          hasActiveSubscription: data.user.hasActiveSubscription || false,
          subscriptionEndDate: data.user.subscriptionEndDate,
          token: data.token,
          progress: data.user.progress || { completedLessons: [], completedModules: [] }
        };
        
        // Сохраняем данные пользователя и токен
        localStorage.setItem(AUTH_CONFIG.storageUserKey, JSON.stringify(authenticatedUser));
        localStorage.setItem(AUTH_CONFIG.storageTokenKey, data.token);
        
        // Устанавливаем пользователя в состояние
        setUser(authenticatedUser);
        setError(null);
        
        return authenticatedUser;
      } else {
        const errorData = await response.json();
        console.error('Ошибка авторизации через Telegram:', errorData);
        setError(errorData.message || 'Ошибка авторизации через Telegram');
        return null;
      }
    } catch (err) {
      console.error('Ошибка при авторизации через Telegram:', err);
      setError('Ошибка при авторизации через Telegram');
      return null;
    }
  };
  
  // Функция для входа по telegramId (для тестирования)
  const login = async (telegramId: number) => {
    setLoading(true);
    
    try {
      // Пробуем сначала выполнить автоматическую авторизацию через Telegram
      const telegramUser = await tryTelegramAuth();
      
      if (telegramUser) {
        setLoading(false);
        return;
      }
      
      // Если автоматическая авторизация не удалась, используем ручной вход по telegramId
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Создаем объект пользователя из данных API
        const authenticatedUser: User = {
          id: data.user.id,
          telegramId: data.user.telegramId,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          username: data.user.username,
          photoUrl: data.user.photoUrl,
          isAdmin: data.user.isAdmin || false,
          hasActiveSubscription: data.user.hasActiveSubscription || false,
          subscriptionEndDate: data.user.subscriptionEndDate,
          token: data.token,
          progress: data.user.progress || { completedLessons: [], completedModules: [] }
        };
        
        // Сохраняем данные пользователя и токен
        localStorage.setItem(AUTH_CONFIG.storageUserKey, JSON.stringify(authenticatedUser));
        localStorage.setItem(AUTH_CONFIG.storageTokenKey, data.token);
        
        // Устанавливаем пользователя в состояние
        setUser(authenticatedUser);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка входа');
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
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