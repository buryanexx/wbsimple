import { useLocation, useNavigate } from 'react-router-dom';

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

  const navItems = [
    {
      name: 'Главная',
      path: '/',
      icon: '🏠'
    },
    {
      name: 'Модули',
      path: '/modules',
      icon: '📚'
    },
    {
      name: 'Шаблоны',
      path: '/templates',
      icon: '📋'
    },
    {
      name: 'Канал',
      path: '/channel',
      icon: '👥'
    },
    {
      name: 'Профиль',
      path: '/profile',
      icon: '👤'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center py-2 px-4 ${
              currentPath === item.path
                ? 'text-primary'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <div className="text-xl">{item.icon}</div>
            <span className="text-xs mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation; 