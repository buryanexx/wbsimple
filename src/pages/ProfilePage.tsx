import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

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
  const isAuthenticated = !!user;
  const { subscription, getFormattedEndDate, getDaysRemaining, features } = useSubscription();
  const webApp = useWebApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'progress' | 'debug'>('info');
  
  // API URLs
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.wbsimple.ru/api';

  useEffect(() => {
    // Загрузка данных пользователя
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        // В реальном проекте здесь будет запрос к API для получения данных профиля
        // const response = await fetch(`${API_BASE_URL}/users/profile`, {
        //   method: 'GET',
        //   headers: {
        //     'Authorization': `Bearer ${user?.token}`,
        //     'Content-Type': 'application/json'
        //   }
        // });
        
        // if (response.ok) {
        //   const profileData = await response.json();
        //   // Обновление данных пользователя при необходимости
        // }
        
        // Имитация задержки загрузки
        setTimeout(() => {
          setIsLoading(false);
        }, 600);
      } catch (error) {
        console.error('Ошибка при загрузке данных профиля:', error);
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Настраиваем кнопку назад
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => {
        navigate('/');
        return true;
      });
    }
    
    return () => {
      if (webApp?.BackButton) {
        webApp.BackButton.hide();
      }
    };
  }, [webApp, navigate, isAuthenticated, user]);

  // Функция для автоматического запуска основного действия в Telegram
  const activateMainButton = (text: string, action: () => void) => {
    if (!webApp?.MainButton) return;
    
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(action);
    webApp.MainButton.show();
    
    return () => {
      webApp.MainButton.offClick(action);
      webApp.MainButton.hide();
    };
  };

  // Функция для обращения к API для обновления профиля
  const updateProfile = async (data: any) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // В реальном проекте здесь будет запрос к API
      // const response = await fetch(`${API_BASE_URL}/users/profile`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${user.token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(data)
      // });
      
      // if (response.ok) {
      //   const updatedProfile = await response.json();
      //   // Обновление данных пользователя при необходимости
      // }
      
      // Для демонстрации показываем сообщение
      if (webApp) {
        webApp.showPopup({
          title: 'Обновление профиля',
          message: 'В реальном приложении данные профиля будут обновлены на сервере.',
          buttons: [{ id: 'ok', type: 'ok', text: 'OK' }]
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      if (webApp) {
        webApp.showAlert('Ошибка при обновлении профиля. Пожалуйста, попробуйте позже.');
      }
    }
  };

  // Функция для очистки хранилища
  const clearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if (webApp) {
        webApp.showPopup({
          title: 'Хранилище очищено',
          message: 'Локальное хранилище очищено. Страница будет перезагружена.',
          buttons: [{ id: 'ok', type: 'ok', text: 'OK' }]
        }, () => {
          window.location.reload();
        });
      } else {
        alert('Хранилище очищено. Перезагрузите страницу.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Ошибка при очистке хранилища:', error);
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
      console.error('Ошибка навигации:', error);
      if (webApp) {
        webApp.showAlert('Ошибка навигации: ' + error);
      } else {
        alert('Ошибка навигации: ' + error);
      }
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

  return (
    <div className="p-4 pb-44">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          leftIcon={<span className="text-lg">←</span>}
        >
          Назад
        </Button>
        <h1 className="text-xl font-bold">Профиль</h1>
        <div className="w-10"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      {/* Профиль пользователя */}
      {!isAuthenticated || !user ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center mb-6">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4">Вы не авторизованы</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Для доступа к полному функционалу приложения необходимо авторизоваться через Telegram.
          </p>
          <Button 
            variant="primary"
            onClick={() => {
              if (webApp) {
                webApp.showAlert('Это приложение работает только в Telegram. Авторизуйтесь, запустив через Telegram.');
              } else {
                alert('Запустите приложение через Telegram для автоматической авторизации.');
              }
            }}
          >
            Авторизоваться
          </Button>
        </div>
      ) : (
        <>
          {/* Шапка профиля */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.firstName} className="w-20 h-20 rounded-full mr-4" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center mr-4 text-2xl font-bold">
                  {user.firstName.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                {user.username && <p className="text-gray-600 dark:text-gray-400 mb-2">@{user.username}</p>}
                
                <div className="mt-2">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    subscription.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      subscription.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    {subscription.isActive ? 'Подписка активна' : 'Нет подписки'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Табы */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Информация
              </button>
              <button
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === 'progress'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('progress')}
              >
                Прогресс
              </button>
              <button
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === 'debug'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('debug')}
              >
                Отладка
              </button>
            </div>
            
            <div className="p-4">
              {activeTab === 'info' && (
                <>
                  {/* Информация о подписке */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3">Подписка</h3>
                    {subscription.isActive ? (
                      <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Статус:</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">Активна</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">План:</span>
                          <span className="capitalize">{subscription.plan}</span>
                        </div>
                        {subscription.endDate && (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Дата окончания:</span>
                              <span>{getFormattedEndDate()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Осталось дней:</span>
                              <span>{getDaysRemaining()}</span>
                            </div>
                          </>
                        )}
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => navigate('/subscription')}
                        >
                          Продлить
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-center mb-4">
                          У вас нет активной подписки. Оформите подписку, чтобы получить доступ
                          ко всем материалам курса.
                        </p>
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => navigate('/subscription')}
                        >
                          Оформить подписку
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Доступные возможности */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Доступные возможности</h3>
                    <ul className="space-y-2">
                      {subscription.features.map((feature, index) => (
                        <li 
                          key={index}
                          className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <span className="text-green-500 mr-3">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              {activeTab === 'progress' && (
                <>
                  <h3 className="text-lg font-bold mb-3">Ваш прогресс</h3>
                  
                  {/* Прогресс по урокам */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Завершено уроков:</span>
                      <span>{user.progress?.completedLessons.length || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                      <div 
                        className="h-2.5 bg-primary rounded-full"
                        style={{ width: `${(user.progress?.completedLessons.length || 0) / 30 * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Прогресс по модулям */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Завершено модулей:</span>
                      <span>{user.progress?.completedModules.length || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                      <div 
                        className="h-2.5 bg-primary rounded-full"
                        style={{ width: `${(user.progress?.completedModules.length || 0) / 8 * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Ближайшие достижения */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Ближайшие достижения</h3>
                    <Card variant="outline" className="mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mr-3">
                          🏆
                        </div>
                        <div>
                          <h4 className="font-medium">Прохождение первого модуля</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Завершите все уроки первого модуля
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card variant="outline">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mr-3">
                          🚀
                        </div>
                        <div>
                          <h4 className="font-medium">Первый товар</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Разместите свой первый товар на маркетплейсе
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              )}
              
              {activeTab === 'debug' && (
                <>
                  <h3 className="text-lg font-bold mb-3">Инструменты отладки</h3>
                  
                  <div className="space-y-3 mb-4">
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={clearStorage}
                    >
                      Очистить хранилище
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        logout();
                        if (webApp) {
                          webApp.showAlert('Вы вышли из аккаунта');
                        }
                      }}
                    >
                      Выйти из аккаунта
                    </Button>
                  </div>
                  
                  <h4 className="font-medium mb-2">Тестовая навигация:</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testNavigation('/')}
                    >
                      Главная
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testNavigation('/modules')}
                    >
                      Модули
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testNavigation('/templates')}
                    >
                      Шаблоны
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testNavigation('/subscription')}
                    >
                      Подписка
                    </Button>
                  </div>
                  
                  <h4 className="font-medium mb-2">Информация:</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    <p className="mb-1">Hash: {window.location.hash}</p>
                    <p className="mb-1">PathName: {window.location.pathname}</p>
                    <p className="mb-1">WebApp: {webApp ? 'Доступен' : 'Недоступен'}</p>
                    <p className="mb-1">User ID: {user?.id}</p>
                    <p className="mb-1">TG ID: {user?.telegramId}</p>
                    <p>Версия: 1.0.0</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage; 