import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import { authAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';

// Конфигурация для авторизации
const AUTH_CONFIG = {
  storageTokenKey: 'wbsimple_token',
  storageRefreshTokenKey: 'wbsimple_refresh_token',
  storageUserKey: 'wbsimple_user',
  tokenRefreshInterval: 30 * 60 * 1000 // 30 минут в миллисекундах
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
  autoRenewal?: boolean;
  token: string;
  progress?: {
    completedLessons: number[];
    completedModules: number[];
  };
}

// Интерфейс для декодированного JWT-токена
interface DecodedToken {
  id: string;
  telegramId: string;
  role: string;
  exp: number;
  iat: number;
}

// Интерфейс для контекста аутентификации
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: () => Promise<User | null>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер аутентификации
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webApp = useWebApp();
  
  // Проверка валидности токена
  const isTokenValid = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      // Проверяем, не истек ли срок действия токена
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
      return false;
    }
  };
  
  // Функция для обновления токена
  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem(AUTH_CONFIG.storageRefreshTokenKey);
      
      if (!refreshToken) {
        throw new Error('Отсутствует refresh токен');
      }
      
      const response = await authAPI.refreshToken(refreshToken);
      const { token, refreshToken: newRefreshToken } = response.data.data;
      
      if (!token || !newRefreshToken) {
        throw new Error('Сервер не вернул новые токены');
      }
      
      // Сохраняем новые токены
      localStorage.setItem(AUTH_CONFIG.storageTokenKey, token);
      localStorage.setItem(AUTH_CONFIG.storageRefreshTokenKey, newRefreshToken);
      
      // Обновляем токен пользователя в state
      if (user) {
        setUser({ ...user, token });
      }
      
      return token;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      
      // При ошибке обновления токена выходим из системы
      logout();
      return null;
    }
  };
  
  // Функция обновления данных пользователя
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem(AUTH_CONFIG.storageTokenKey);
      
      if (!token) {
        throw new Error('Отсутствует токен авторизации');
      }
      
      // Проверяем валидность токена
      if (!isTokenValid(token)) {
        // Если токен невалидный, пытаемся обновить его
        const newToken = await refreshToken();
        if (!newToken) {
          throw new Error('Не удалось обновить токен');
        }
      }
      
      const response = await authAPI.getCurrentUser();
      
      if (response.data && response.data.user) {
        // Обновляем данные пользователя, сохраняя текущий токен
        const updatedUser = { 
          ...response.data.user,
          token: localStorage.getItem(AUTH_CONFIG.storageTokenKey) || ''
        };
        
        setUser(updatedUser);
        localStorage.setItem(AUTH_CONFIG.storageUserKey, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
      // Если при обновлении данных возникла ошибка авторизации, выходим из системы
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  };
  
  // Функция для получения данных Telegram
  const getTelegramData = () => {
    if (!window.Telegram || !window.Telegram.WebApp) {
      return { initData: '', telegramUser: null };
    }
    
    try {
      const initData = window.Telegram.WebApp.initData;
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      
      return { initData, telegramUser };
    } catch (error) {
      console.error('Ошибка при получении данных Telegram:', error);
      return { initData: '', telegramUser: null };
    }
  };

  // Проверка аутентификации при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем сохраненный токен и пользователя
        const savedToken = localStorage.getItem(AUTH_CONFIG.storageTokenKey);
        const savedUser = localStorage.getItem(AUTH_CONFIG.storageUserKey);
        
        if (savedToken && savedUser) {
          // Проверяем валидность токена
          if (isTokenValid(savedToken)) {
            // Устанавливаем сохраненного пользователя
            setUser(JSON.parse(savedUser));
            
            // Обновляем данные пользователя
            await refreshUserData();
            setError(null);
          } else {
            // Если токен невалидный, пытаемся обновить его
            const newToken = await refreshToken();
            
            if (newToken) {
              // Если удалось обновить токен, обновляем данные пользователя
              await refreshUserData();
              setError(null);
            } else {
              // Если не удалось обновить токен, пытаемся авторизоваться заново
              await login();
            }
          }
        } else {
          // Если нет сохраненных данных, пытаемся авторизоваться через Telegram
          await login();
        }
      } catch (error) {
        console.error('Ошибка при проверке аутентификации:', error);
        setError('Ошибка при проверке аутентификации');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Устанавливаем интервал для обновления токена
    const refreshInterval = setInterval(() => {
      const token = localStorage.getItem(AUTH_CONFIG.storageTokenKey);
      
      if (token && user) {
        // Проверяем, не истекает ли токен в ближайшее время
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const currentTime = Date.now() / 1000;
          
          // Если до истечения токена осталось менее 5 минут, обновляем его
          if (decoded.exp - currentTime < 5 * 60) {
            refreshToken();
          }
        } catch (error) {
          console.error('Ошибка при проверке времени истечения токена:', error);
        }
      }
    }, AUTH_CONFIG.tokenRefreshInterval);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [webApp]);
  
  // Функция для авторизации
  const login = async (): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Для локальной разработки можно использовать демо-пользователя
      if (process.env.NODE_ENV === 'development' && (!window.Telegram || !window.Telegram.WebApp)) {
        const demoUser = createDemoUser();
        setLoading(false);
        return demoUser;
      }
      
      const { initData, telegramUser } = getTelegramData();
      
      if (!initData || !telegramUser) {
        // Если мы в режиме разработки и не смогли получить данные Telegram, создаем демо-пользователя
        if (process.env.NODE_ENV === 'development') {
          const demoUser = createDemoUser();
          setLoading(false);
          return demoUser;
        }
        
        throw new Error('Не удалось получить данные Telegram');
      }
      
      const response = await authAPI.telegramAuth({ 
        initData, 
        telegramUser 
      });
      
      const { token, refreshToken, user } = response.data.data;
      
      if (!token || !user) {
        throw new Error('Сервер вернул некорректные данные');
      }
      
      // Добавляем токен к объекту пользователя
      const authenticatedUser = { ...user, token };
      
      // Сохраняем данные пользователя и токены
      localStorage.setItem(AUTH_CONFIG.storageUserKey, JSON.stringify(authenticatedUser));
      localStorage.setItem(AUTH_CONFIG.storageTokenKey, token);
      
      // Если есть refresh токен, сохраняем его
      if (refreshToken) {
        localStorage.setItem(AUTH_CONFIG.storageRefreshTokenKey, refreshToken);
      }
      
      // Устанавливаем пользователя в состояние
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      setError('Ошибка при авторизации');
      
      // В режиме разработки создаем демо-пользователя при ошибке
      if (process.env.NODE_ENV === 'development') {
        const demoUser = createDemoUser();
        return demoUser;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Вспомогательная функция для создания демо-пользователя (только для разработки)
  const createDemoUser = () => {
    const demoUser: User = {
      id: Math.floor(Math.random() * 1000000),
      telegramId: Math.floor(Math.random() * 1000000),
      firstName: 'Демо',
      lastName: 'Пользователь',
      username: 'demo_user',
      isAdmin: true, // Для тестирования админ-функций
      hasActiveSubscription: true, // Для тестирования включаем подписку
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней
      autoRenewal: true,
      token: 'demo_token_' + Math.random().toString(36).substring(7),
      progress: {
        completedLessons: [1, 2],
        completedModules: []
      }
    };
    
    // Сохраняем данные пользователя и токен
    localStorage.setItem(AUTH_CONFIG.storageUserKey, JSON.stringify(demoUser));
    localStorage.setItem(AUTH_CONFIG.storageTokenKey, demoUser.token);
    localStorage.setItem(AUTH_CONFIG.storageRefreshTokenKey, 'demo_refresh_token_' + Math.random().toString(36).substring(7));
    
    // Устанавливаем пользователя в состояние
    setUser(demoUser);
    setError(null);
    console.log('Создан демо-пользователь для разработки');
    return demoUser;
  };
  
  // Функция для выхода
  const logout = () => {
    // Удаляем данные из localStorage
    localStorage.removeItem(AUTH_CONFIG.storageUserKey);
    localStorage.removeItem(AUTH_CONFIG.storageTokenKey);
    localStorage.removeItem(AUTH_CONFIG.storageRefreshTokenKey);
    
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
    updateUser,
    refreshUserData
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