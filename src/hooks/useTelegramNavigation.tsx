import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

/**
 * Хук для прямой интеграции с Telegram WebApp навигацией
 */
export const useTelegramNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const webApp = useWebApp();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  
  // Отслеживаем изменения маршрута
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  // Настройка кнопки "Назад"
  useEffect(() => {
    if (!webApp) return;
    
    // Показываем кнопку "Назад", если не находимся на главной странице
    if (currentPath !== '/') {
      webApp.BackButton?.show();
      
      // Функция для обработки нажатия
      const handleBackButtonClick = () => {
        navigate(-1);
      };
      
      webApp.BackButton?.onClick(handleBackButtonClick);
      
      return () => {
        webApp.BackButton?.offClick(handleBackButtonClick);
        webApp.BackButton?.hide();
      };
    } else {
      webApp.BackButton?.hide();
    }
  }, [currentPath, navigate, webApp]);

  // Функция для безопасной навигации
  const navigationHandler = useCallback((path: string) => {
    // Если уже находимся на этом маршруте, не делаем ничего
    if (currentPath === path) return;
    
    // Используем специальный хэш-формат для Telegram WebApp
    try {
      // Уведомляем Telegram о начале перехода
      webApp?.HapticFeedback?.impactOccurred('light');
      
      // Используем историю браузера напрямую для роутинга
      if (path === '/') {
        window.location.hash = '';
      } else {
        window.location.hash = path;
      }
      
      // Принудительно обновляем текущий путь
      setCurrentPath(path);
      
      // Сообщаем Telegram, что переход завершен
      setTimeout(() => {
        webApp?.HapticFeedback?.notificationOccurred('success');
      }, 100);
    } catch (error) {
      console.error('Ошибка навигации:', error);
    }
  }, [currentPath, webApp]);
  
  // Обработчик для ссылок
  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Получаем целевой маршрут из атрибута data-path или другого источника
    const targetPath = e.currentTarget.dataset.path;
    
    if (targetPath) {
      navigationHandler(targetPath);
    }
  }, [navigationHandler]);

  // Обработка внешних ссылок
  const openExternalLink = useCallback((url: string) => {
    if (!url) return;
    
    if (url.startsWith('http') && webApp) {
      webApp.openLink(url);
    }
  }, [webApp]);

  // Слушаем хэш-изменения
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const newPath = hash || '/';
      
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
        navigate(newPath, { replace: true });
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentPath, navigate]);

  return {
    currentPath,
    navigateTo: navigationHandler,
    handleClick,
    openExternalLink,
    webApp
  };
};

export default useTelegramNavigation; 