import { useLocation, useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import { useEffect, useState } from 'react';
import Icon from './Icon';

const BottomNavigation = () => {
  const location = useLocation();
  const webApp = useWebApp();
  const [activeRoute, setActiveRoute] = useState('/');
  const navigate = useNavigate();
  
  // Эффект для обновления активного маршрута при изменении местоположения
  useEffect(() => {
    // Получаем текущий путь из react-router-dom
    setActiveRoute(location.pathname);
    
    if (window.tgWebAppLogs) {
      window.tgWebAppLogs.push({
        time: new Date().toISOString(),
        message: `Обновление активного пути: ${location.pathname}`
      });
    }
  }, [location]);
  
  // Обновляем активный путь при изменении location
  useEffect(() => {
    // Используем pathname из react-router для браузера
    // и хеш для Telegram WebApp
    const currentPath = location.pathname !== '/' 
      ? location.pathname 
      : '';
      
    setActiveRoute(currentPath);
    
    // Логируем для отладки
    if (window.tgWebAppLogs) {
      window.tgWebAppLogs.push({
        time: new Date().toISOString(),
        message: `Navigation активный путь: ${currentPath}, hash: ${window.location.hash}, pathname: ${location.pathname}`
      });
    }
    
    // Настройка кнопки назад в Telegram WebApp
    if (webApp?.BackButton) {
      if (currentPath !== '/' && currentPath !== '') {
        webApp.BackButton.show();
      } else {
        webApp.BackButton.hide();
      }
    }
  }, [location, webApp]);
  
  // Проверяем, находимся ли мы на странице урока
  const isLessonPage = activeRoute.includes('/lesson/');
  
  // Если мы на странице урока, не показываем навигацию
  if (isLessonPage) {
    return null;
  }

  // Оптимизированные элементы навигации (4 пункта)
  const navItems = [
    {
      name: 'Главная',
      path: '/',
      icon: 'home'
    },
    {
      name: 'Модули',
      path: '/modules',
      icon: 'modules'
    },
    {
      name: 'Шаблоны',
      path: '/templates',
      icon: 'templates'
    },
    {
      name: 'Профиль',
      path: '/profile',
      icon: 'profile'
    }
  ] as const;

  // Обработчик навигации специально для Telegram WebApp
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    
    if (window.tgWebAppLogs) {
      window.tgWebAppLogs.push({
        time: new Date().toISOString(),
        message: `Навигация к: ${path}`
      });
    }
    
    console.log('Переход на путь:', path);
    
    // Показываем индикатор загрузки в Telegram
    if (webApp?.MainButton) {
      webApp.MainButton.showProgress();
      setTimeout(() => {
        webApp.MainButton.hideProgress();
      }, 500);
    }
    
    try {
      // Сначала пробуем react-router-dom для навигации
      navigate(path);
      
      // Затем дублируем навигацию через хеш для надежности
      setTimeout(() => {
        if (window.location.hash !== `#${path}`) {
          console.log('Корректировка хеша:', path);
          window.location.hash = path;
        }
      }, 50);
    } catch (error) {
      console.error('Ошибка навигации:', error);
      // Запасной вариант - прямая установка хеша
      window.location.hash = path;
    }
    
    // Сбрасываем скролл наверх
    window.scrollTo(0, 0);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          // Проверяем активный пункт
          const isActive = 
            item.path === activeRoute || 
            (item.path === '/' && (activeRoute === '' || activeRoute === '/')) ||
            (activeRoute.startsWith(item.path) && item.path !== '/');
            
          console.log(`Проверка активности ${item.path}:`, isActive);
          
          return (
            <a
              key={item.path}
              href={`#${item.path}`}
              onClick={(e) => handleNavigation(e, item.path)}
              className={`flex flex-col items-center py-2 px-3 transition-colors duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon 
                name={item.icon} 
                size={20} 
                className={isActive ? 'animate-pulse' : ''} 
              />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation; 