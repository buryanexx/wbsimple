import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

const HomePage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();

  useEffect(() => {
    // Проверяем, первый ли это визит пользователя
    const isFirstVisit = localStorage.getItem('wb_simple_first_visit') !== 'false';
    
    if (isFirstVisit) {
      // Если первый визит, перенаправляем на онбординг
      localStorage.setItem('wb_simple_first_visit', 'false');
      navigate('/onboarding');
    }
    
    // Настраиваем кнопку Telegram
    if (webApp?.MainButton) {
      webApp.MainButton.setText('Начать обучение');
      webApp.MainButton.show();
      webApp.MainButton.onClick(() => {
        navigate('/modules');
      });
    }
    
    return () => {
      // Скрываем кнопку при размонтировании компонента
      webApp?.MainButton?.hide();
    };
  }, [navigate, webApp]);

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">
          WB Simple
        </h1>
        
        <div className="tg-card mb-6">
          <h2 className="text-xl font-semibold mb-2">Добро пожаловать!</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Образовательная платформа для обучения заработку на Wildberries с нуля до 1.000.000 рублей.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => navigate('/modules')} 
            className="tg-button flex items-center justify-center"
          >
            Модули курса
          </button>
          
          <button 
            onClick={() => navigate('/templates')} 
            className="tg-button-accent flex items-center justify-center"
          >
            Шаблоны
          </button>
        </div>
        
        <div className="tg-card">
          <h3 className="text-lg font-semibold mb-2">Ваш прогресс</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Начните обучение, чтобы отслеживать свой прогресс
          </p>
        </div>
      </div>
      
      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
        <button 
          onClick={() => navigate('/subscription')} 
          className="tg-button-accent"
        >
          Оформить подписку
        </button>
      </div>
    </div>
  );
};

export default HomePage; 