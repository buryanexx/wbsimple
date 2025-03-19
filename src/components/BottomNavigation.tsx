import { useLocation } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import { useEffect, useState } from 'react';
import Icon from './Icon';

const BottomNavigation = () => {
  const location = useLocation();
  const webApp = useWebApp();
  const [activeRoute, setActiveRoute] = useState('/');
  
  // Получаем текущий путь из pathname
  useEffect(() => {
    setActiveRoute(location.pathname);
    console.log('Активный путь обновлен:', location.pathname);
  }, [location]);
  
  // Проверяем, находимся ли мы на странице урока
  const isLessonPage = activeRoute.includes('/lesson/');
  if (isLessonPage) return null;

  // Элементы навигации
  const navItems = [
    { name: 'Главная', path: '/', icon: 'home' },
    { name: 'Модули', path: '/modules', icon: 'modules' },
    { name: 'Шаблоны', path: '/templates', icon: 'templates' },
    { name: 'Профиль', path: '/profile', icon: 'profile' }
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          // Определяем активность
          const isActive = 
            item.path === activeRoute || 
            (item.path === '/' && (activeRoute === '' || activeRoute === '/')) ||
            (activeRoute.startsWith(item.path) && item.path !== '/');
          
          return (
            <a
              key={item.path}
              href={`#${item.path}`} // Убираю первый слеш чтобы не было дублирования
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