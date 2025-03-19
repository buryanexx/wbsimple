import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import { API_URL, AUTH_CONFIG } from '../config';

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
  login: (initData: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isPremium: boolean;
  hasCompletedLesson: (lessonId: number) => boolean;
  hasCompletedModule: (moduleId: number) => boolean;
  markLessonCompleted: (lessonId: number) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Создаем контекст аутентификации
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер аутентификации
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webApp = useWebApp();

  // Проверяем, аутентифицирован ли пользователь
  const isAuthenticated = !!user;
  
  // Проверяем, есть ли у пользователя активная подписка
  const isPremium = user?.hasActiveSubscription || false;

  // Проверяем, завершил ли пользователь урок
  const hasCompletedLesson = (lessonId: number): boolean => {
    if (!user?.progress?.completedLessons) return false;
    return user.progress.completedLessons.includes(lessonId);
  };

  // Проверяем, завершил ли пользователь модуль
  const hasCompletedModule = (moduleId: number): boolean => {
    if (!user?.progress?.completedModules) return false;
    return user.progress.completedModules.includes(moduleId);
  };

  // Отмечаем урок как завершенный
  const markLessonCompleted = async (lessonId: number): Promise<void> => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось отметить урок как завершенный');
      }

      // Обновляем данные пользователя
      await refreshUserData();
    } catch (err) {
      console.error('Ошибка при отметке урока как завершенного:', err);
      setError('Не удалось отметить урок как завершенный');
    }
  };

  // Обновляем данные пользователя
  const refreshUserData = async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось получить данные пользователя');
      }

      const userData = await response.json();
      setUser({ ...userData, token: user.token });
    } catch (err) {
      console.error('Ошибка при обновлении данных пользователя:', err);
      setError('Не удалось обновить данные пользователя');
    }
  };

  // Функция для входа пользователя
  const login = async (initData: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка аутентификации');
      }

      const data = await response.json();
      
      // Сохраняем данные пользователя и токен
      setUser(data.user);
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(AUTH_CONFIG.INIT_DATA_KEY, initData);
    } catch (err: any) {
      console.error('Ошибка при входе:', err);
      setError(err.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  // Функция для выхода пользователя
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.INIT_DATA_KEY);
  };

  // Проверяем наличие сохраненных данных пользователя при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Получаем сохраненные данные
        const savedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        const savedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);
        const savedInitData = localStorage.getItem(AUTH_CONFIG.INIT_DATA_KEY) || webApp?.initData;
        
        if (savedToken && savedUser) {
          // Если есть сохраненные данные, восстанавливаем сессию
          const parsedUser = JSON.parse(savedUser);
          setUser({ ...parsedUser, token: savedToken });
        } else if (savedInitData) {
          // Если есть initData, пытаемся войти
          await login(savedInitData);
        }
      } catch (err) {
        console.error('Ошибка при инициализации аутентификации:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [webApp]);

  // Значение контекста
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    isPremium,
    hasCompletedLesson,
    hasCompletedModule,
    markLessonCompleted,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста аутентификации
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 