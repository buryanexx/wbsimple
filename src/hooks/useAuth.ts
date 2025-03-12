import { useState, useEffect } from 'react';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import { authAPI } from '../services/api';

interface User {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  isSubscribed: boolean;
  subscriptionExpiry?: Date;
  progress: {
    completedLessons: number[];
    completedModules: number[];
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webApp = useWebApp();

  // Функция для аутентификации через Telegram
  const telegramAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!webApp || !webApp.initDataUnsafe) {
        throw new Error('Не удалось получить данные Telegram');
      }

      // Получаем полные данные initData для проверки подписи на сервере
      const initData = webApp.initData;
      const telegramUser = webApp.initDataUnsafe.user;
      
      if (!telegramUser) {
        throw new Error('Не удалось получить данные пользователя Telegram');
      }
      
      const response = await authAPI.telegramAuth({
        initData,
        telegramUser
      });
      
      const { token, user } = response.data;
      
      // Сохраняем токен и initData в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('telegram_init_data', initData);
      
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.message || 'Ошибка аутентификации');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения данных текущего пользователя
  const getCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const initData = localStorage.getItem('telegram_init_data') || webApp?.initData;
      
      if (!token || !initData) {
        setUser(null);
        return null;
      }

      const response = await authAPI.getCurrentUser(initData);
      const { user } = response.data;
      
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.message || 'Ошибка получения данных пользователя');
      localStorage.removeItem('token');
      localStorage.removeItem('telegram_init_data');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Функция для выхода из аккаунта
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('telegram_init_data');
    setUser(null);
  };

  // При монтировании компонента проверяем, есть ли сохраненный токен
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const initData = localStorage.getItem('telegram_init_data');
      
      if (token && initData) {
        // Если есть токен и initData, получаем данные пользователя
        await getCurrentUser();
      } else if (webApp && webApp.initData) {
        // Если нет токена или initData, но есть данные Telegram, выполняем аутентификацию
        await telegramAuth();
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [webApp]);

  // Функция для проверки, истек ли токен
  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    // Здесь можно добавить логику проверки срока действия токена,
    // если сервер возвращает информацию о сроке действия
    
    return false;
  };

  // Функция для обновления токена
  const refreshToken = async () => {
    if (webApp && webApp.initData) {
      return await telegramAuth();
    }
    return null;
  };

  return {
    user,
    loading,
    error,
    telegramAuth,
    getCurrentUser,
    logout,
    isTokenExpired,
    refreshToken
  };
};

export default useAuth; 