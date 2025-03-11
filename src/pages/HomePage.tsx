import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

const HomePage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

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
      clearTimeout(timer);
    };
  }, [navigate, webApp]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6 animate-fade-in pb-24">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">
          WB Simple
        </h1>
        
        <Card variant="primary" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Добро пожаловать!</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Образовательная платформа для обучения заработку на Wildberries с нуля до 1.000.000 рублей.
          </p>
        </Card>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            variant="primary" 
            fullWidth
            leftIcon={<Icon name="modules" size={18} />}
            onClick={() => navigate('/modules')}
          >
            Модули курса
          </Button>
          
          <Button 
            variant="accent" 
            fullWidth
            leftIcon={<Icon name="templates" size={18} />}
            onClick={() => navigate('/templates')}
          >
            Шаблоны
          </Button>
        </div>
        
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Ваш прогресс</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-1000" style={{ width: '0%' }}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Начните обучение, чтобы отслеживать свой прогресс
          </p>
        </Card>
        
        <Card variant="accent" className="mb-6">
          <div className="flex items-start">
            <div className="mr-4 mt-1 text-accent text-2xl">💡</div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Совет дня</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Регулярно обновляйте карточки товаров на Wildberries для улучшения ранжирования в поиске.
              </p>
            </div>
          </div>
        </Card>
        
        <Button 
          variant="accent" 
          size="lg"
          fullWidth
          className="mb-10"
          onClick={() => navigate('/subscription')}
        >
          Оформить подписку
        </Button>
      </div>
    </div>
  );
};

export default HomePage; 