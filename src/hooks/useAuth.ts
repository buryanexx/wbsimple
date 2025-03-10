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

      if (!webApp || !webApp.initDataUnsafe || !webApp.initDataUnsafe.user) {
        throw new Error('Не удалось получить данные пользователя Telegram');
      }

      const telegramData = webApp.initDataUnsafe.user;
      
      const response = await authAPI.telegramAuth(telegramData);
      const { token, user } = response.data;
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', token);
      
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
      if (!token) {
        setUser(null);
        return null;
      }

      const response = await authAPI.getCurrentUser();
      const { user } = response.data;
      
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.message || 'Ошибка получения данных пользователя');
      localStorage.removeItem('token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Функция для выхода из аккаунта
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // При монтировании компонента проверяем, есть ли сохраненный токен
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Если есть токен, получаем данные пользователя
        await getCurrentUser();
      } else if (webApp && webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
        // Если нет токена, но есть данные пользователя Telegram, выполняем аутентификацию
        await telegramAuth();
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [webApp]);

  return {
    user,
    loading,
    error,
    telegramAuth,
    getCurrentUser,
    logout
  };
};

export default useAuth; 