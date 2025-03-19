import { useEffect, useState, useCallback, useRef } from 'react';
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
  const isNavigatingRef = useRef(false);
  
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
    // Если уже находимся на этом маршруте или идет навигация, не делаем ничего
    if (currentPath === path || isNavigatingRef.current) return;
    
    // Устанавливаем флаг навигации
    isNavigatingRef.current = true;
    
    console.log('Начинаем навигацию к:', path);
    
    // Используем особый подход для Telegram WebApp
    try {
      // Уведомляем Telegram о начале перехода
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('light');
      }
      
      // 1. Сначала программно вызываем navigate из react-router
      navigate(path, { replace: true });
      
      // 2. Принудительно обновляем текущий путь
      setCurrentPath(path);
      
      // 3. Обновляем хеш в URL
      setTimeout(() => {
        if (path === '/') {
          window.history.replaceState(null, '', '#/');
        } else {
          window.history.replaceState(null, '', '#' + path);
        }
        
        // Искусственно создаем событие hashchange
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        
        // Отключаем флаг навигации после небольшой задержки
        setTimeout(() => {
          isNavigatingRef.current = false;
          console.log('Навигация завершена:', path);
          
          // Отправляем сигнал вибрации для подтверждения навигации
          if (webApp?.HapticFeedback) {
            webApp.HapticFeedback.notificationOccurred('success');
          }
        }, 50);
      }, 0);
    } catch (error) {
      console.error('Ошибка навигации:', error);
      isNavigatingRef.current = false;
    }
  }, [currentPath, navigate, webApp]);
  
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
      if (isNavigatingRef.current) return; // Игнорируем, если уже идет навигация
      
      const hash = window.location.hash.replace('#', '') || '/';
      
      console.log('Обнаружено изменение хеша:', hash);
      
      if (hash !== currentPath) {
        // Устанавливаем флаг навигации
        isNavigatingRef.current = true;
        
        // Обновляем путь через react-router
        navigate(hash, { replace: true });
        setCurrentPath(hash);
        
        // Снимаем флаг навигации
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 50);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Проверяем начальный хеш при монтировании
    if (window.location.hash && window.location.hash !== '#' + currentPath && window.location.hash !== '#/') {
      const initialHash = window.location.hash.replace('#', '') || '/';
      if (initialHash !== currentPath) {
        navigate(initialHash, { replace: true });
        setCurrentPath(initialHash);
      }
    }
    
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