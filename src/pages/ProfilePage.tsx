import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';

// Типы для данных профиля
interface UserProfile {
  name: string;
  photo?: string;
  subscriptionStatus: 'active' | 'inactive';
  subscriptionExpiry?: string;
  progress: {
    completedLessons: number;
    totalLessons: number;
    completedModules: number;
    totalModules: number;
  };
  achievements: {
    id: number;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }[];
}

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const webApp = useWebApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'achievements'>('progress');
  const [showLogs, setShowLogs] = useState(false);
  const [logsContent, setLogsContent] = useState<any[]>([]);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные
      const mockProfile: UserProfile = {
        name: webApp?.initDataUnsafe?.user?.first_name || 'Пользователь',
        photo: webApp?.initDataUnsafe?.user?.photo_url,
        subscriptionStatus: 'inactive',
        progress: {
          completedLessons: 5,
          totalLessons: 42,
          completedModules: 1,
          totalModules: 8
        },
        achievements: [
          {
            id: 1,
            title: 'Первые шаги',
            description: 'Завершите первый урок',
            icon: '🏆',
            unlocked: true
          },
          {
            id: 2,
            title: 'Исследователь',
            description: 'Изучите все материалы первого модуля',
            icon: '🔍',
            unlocked: true
          },
          {
            id: 3,
            title: 'Знаток Wildberries',
            description: 'Пройдите все тесты с первой попытки',
            icon: '🧠',
            unlocked: false
          },
          {
            id: 4,
            title: 'Мастер продаж',
            description: 'Достигните 100 000 рублей продаж',
            icon: '💰',
            unlocked: false
          },
          {
            id: 5,
            title: 'Эксперт Wildberries',
            description: 'Завершите все модули курса',
            icon: '🎓',
            unlocked: false
          }
        ]
      };
      
      setProfile(mockProfile);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [webApp]);

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  // Обработчик для отображения логов
  const handleShowLogs = () => {
    setShowLogs(true);
    const logs = window.tgWebAppLogs || [];
    const errors = window.tgWebAppErrors || [];
    setLogsContent([...logs, ...errors]);
  };

  // Функция для копирования логов
  const copyLogs = () => {
    const logText = JSON.stringify(logsContent, null, 2);
    navigator.clipboard.writeText(logText)
      .then(() => alert('Логи скопированы в буфер обмена'))
      .catch(err => alert('Ошибка копирования: ' + err));
  };

  // Функция для очистки хранилища
  const clearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      alert('Хранилище очищено. Перезагрузите страницу.');
    } catch (error) {
      alert('Ошибка очистки: ' + error);
    }
  };

  // Функция для тестовой навигации
  const testNavigation = (path: string) => {
    try {
      if (window.safeTelegramNavigation) {
        window.safeTelegramNavigation(path);
      } else {
        window.location.hash = path;
      }
    } catch (error) {
      alert('Ошибка навигации: ' + error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка профиля...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg mb-4">Не удалось загрузить профиль</p>
        <Button 
          variant="primary"
          onClick={() => navigate('/')}
        >
          Вернуться на главную
        </Button>
      </div>
    );
  }

  const progressPercentage = Math.round(
    (profile.progress.completedLessons / profile.progress.totalLessons) * 100
  );

  const moduleProgressPercentage = Math.round(
    (profile.progress.completedModules / profile.progress.totalModules) * 100
  );

  return (
    <div className="container max-w-lg mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold text-center mb-6">Профиль</h1>
      
      {user ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center mb-4">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.firstName} className="w-16 h-16 rounded-full mr-4" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mr-4 text-xl font-bold">
                {user.firstName.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
              {user.username && <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>}
            </div>
          </div>
          
          {user.hasActiveSubscription ? (
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mb-4">
              <p className="font-medium text-green-800 dark:text-green-200">
                Активная подписка до: {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : 'Бессрочно'}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg mb-4">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                У вас нет активной подписки
              </p>
              <a 
                href="#/subscription" 
                className="inline-block mt-2 text-sm font-medium text-primary dark:text-primary-light"
              >
                Оформить подписку
              </a>
            </div>
          )}
          
          <button 
            onClick={() => logout()} 
            className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Выйти
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Вы не авторизованы
          </p>
        </div>
      )}
      
      {/* Блок для отладки */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-bold mb-3">Инструменты отладки</h2>
        
        <div className="space-y-3">
          <button 
            onClick={handleShowLogs} 
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Показать логи
          </button>
          
          <button 
            onClick={clearStorage} 
            className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Очистить хранилище
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => testNavigation('/')} 
              className="py-2 px-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
            >
              Тест: Главная
            </button>
            <button 
              onClick={() => testNavigation('/modules')} 
              className="py-2 px-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
            >
              Тест: Модули
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Hash: {window.location.hash}</p>
            <p>PathName: {window.location.pathname}</p>
            <p>WebApp: {webApp ? 'Доступен' : 'Недоступен'}</p>
          </div>
        </div>
      </div>
      
      {/* Модальное окно с логами */}
      {showLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Логи</h3>
              <div className="space-x-2">
                <button 
                  onClick={copyLogs}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md"
                >
                  Копировать
                </button>
                <button 
                  onClick={() => setShowLogs(false)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md"
                >
                  Закрыть
                </button>
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md text-xs font-mono h-[300px] overflow-auto">
              {logsContent.length > 0 ? (
                logsContent.map((log, index) => (
                  <div key={index} className={`mb-1 p-1 ${log.error ? 'text-red-500' : ''}`}>
                    <span className="opacity-50">[{log.time}]</span>{' '}
                    {log.message || log.error}
                  </div>
                ))
              ) : (
                <p>Нет логов</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 