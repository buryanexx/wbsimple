import { useLocation } from 'react-router-dom';
import Icon from './Icon';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

const BottomNavigation = () => {
  const location = useLocation();
  const webApp = useWebApp();
  const currentPath = location.pathname;
  
  // Проверяем, находимся ли мы на странице урока
  const isLessonPage = currentPath.includes('/lesson/');
  
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
    
    // Добавляем индикатор загрузки
    if (webApp?.MainButton) {
      webApp.MainButton.showProgress();
      setTimeout(() => {
        webApp.MainButton.hideProgress();
      }, 500);
    }
    
    // Безопасная навигация через хеш
    window.location.hash = path;
    
    // Если доступна функция безопасной навигации для Telegram
    if (window.safeTelegramNavigation) {
      window.safeTelegramNavigation(path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          // Проверяем активный пункт по текущему хешу
          const isActive = currentPath === item.path || 
                          (currentPath === '' && item.path === '/');
          
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