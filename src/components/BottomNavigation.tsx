import { useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
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
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation; 