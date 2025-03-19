import { useNavigate, useLocation } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import { useEffect } from 'react';

/**
 * Хук для улучшения навигации в Telegram WebApp
 */
export const useWebAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const webApp = useWebApp();
  
  // Настраиваем кнопку назад
  useEffect(() => {
    if (!webApp) return;
    
    // Если не главная страница - показываем кнопку назад
    if (location.pathname !== '/') {
      webApp.BackButton?.show();
      
      // Обработчик для кнопки назад
      const handleBackButton = () => {
        navigate(-1);
      };
      
      webApp.BackButton?.onClick(handleBackButton);
      
      return () => {
        webApp.BackButton?.offClick(handleBackButton);
        webApp.BackButton?.hide();
      };
    } else {
      webApp.BackButton?.hide();
    }
  }, [location.pathname, navigate, webApp]);
  
  // Безопасная навигация по маршрутам
  const safeNavigate = (path: string, replace = false) => {
    // Проверяем, что не переходим на ту же страницу
    if (location.pathname !== path) {
      if (replace) {
        navigate(path, { replace: true });
      } else {
        navigate(path);
      }
    }
  };
  
  // Функция для обработки обычных ссылок и преобразования их в SPA-навигацию
  const handleExternalLink = (url: string) => {
    if (!url) return;
    
    // Открываем внешние ссылки через Telegram WebApp
    if (url.startsWith('http') && webApp) {
      webApp.openLink(url);
      return;
    }
    
    // Для внутренних ссылок используем navigate
    if (url.startsWith('/')) {
      safeNavigate(url);
    }
  };
  
  return {
    safeNavigate,
    handleExternalLink,
    webApp,
    currentPath: location.pathname
  };
};

export default useWebAppNavigation; 