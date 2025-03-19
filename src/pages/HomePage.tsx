import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import useWebAppNavigation from '../hooks/useWebAppNavigation';

const HomePage = () => {
  const { safeNavigate, webApp } = useWebAppNavigation();
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
      safeNavigate('/onboarding');
    }
    
    // Настраиваем кнопку Telegram
    if (webApp?.MainButton) {
      webApp.MainButton.setText('Начать обучение');
      webApp.MainButton.show();
      webApp.MainButton.onClick(() => {
        safeNavigate('/modules');
      });
    }
    
    return () => {
      // Скрываем кнопку при размонтировании компонента
      webApp?.MainButton?.hide();
      clearTimeout(timer);
    };
  }, [safeNavigate, webApp]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
      </div>
    );
  }

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    safeNavigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6 animate-fade-in pb-36">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-[#6A45E8] mb-6">
          WB Simple
        </h1>
        
        <Card variant="primary" className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Добро пожаловать!</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Образовательная платформа для обучения заработку на Wildberries с нуля до 1.000.000 рублей.
          </p>
        </Card>

        {/* Баннер для первого модуля */}
        <div className="bg-gradient-to-r from-[#6A45E8] to-[#8A65FF] text-white rounded-lg p-4 mb-6 shadow-md">
          <h3 className="text-lg font-bold flex items-center">
            <span className="mr-2">✨</span> Первый модуль бесплатно!
          </h3>
          <p className="text-sm mt-1 text-white text-opacity-90">
            Изучите основы работы с Wildberries и получите первые результаты
          </p>
          <Button 
            variant="white" 
            className="mt-2 bg-white text-[#6A45E8] hover:bg-gray-100"
            size="sm"
            onClick={(e) => handleNavigation(e, '/modules')}
          >
            Начать обучение
          </Button>
        </div>
        
        {/* Совет дня (перемещен выше) */}
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
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            variant="primary" 
            fullWidth
            leftIcon={<Icon name="modules" size={18} />}
            onClick={(e) => handleNavigation(e, '/modules')}
            className="bg-gradient-to-r from-[#6A45E8] to-[#8A65FF] border-none"
          >
            Модули курса
          </Button>
          
          <Button 
            variant="accent" 
            fullWidth
            leftIcon={<Icon name="templates" size={18} />}
            onClick={(e) => handleNavigation(e, '/templates')}
            className="bg-gradient-to-r from-[#F97316] to-[#FB923C] border-none"
          >
            Шаблоны
          </Button>
        </div>
        
        <h3 className="text-xl font-bold text-[#6A45E8] mb-3">Бесплатные инструменты</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
            onClick={(e) => handleNavigation(e, '/calculator')}
          >
            {/* Метка "Бесплатно" */}
            <div className="absolute -right-12 top-6 w-36 bg-green-500 text-white text-xs text-center font-medium py-1 transform rotate-45">
              Бесплатно
            </div>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-[#6A45E8] flex items-center justify-center text-white mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Калькулятор прибыли</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Рассчитайте потенциальную прибыль от продаж на Wildberries
            </p>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
            onClick={(e) => handleNavigation(e, '/wb-calculator')}
          >
            {/* Метка "Бесплатно" */}
            <div className="absolute -right-12 top-6 w-36 bg-green-500 text-white text-xs text-center font-medium py-1 transform rotate-45">
              Бесплатно
            </div>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-[#6A45E8] flex items-center justify-center text-white mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Калькулятор WB 2024</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Актуальный расчет комиссий и расходов Wildberries
            </p>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={(e) => handleNavigation(e, '/timeline')}
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">План запуска</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Узнайте сроки каждого этапа запуска бизнеса на Wildberries
            </p>
          </div>
        </div>
        
        <Button 
          variant="accent" 
          size="lg"
          fullWidth
          className="mb-10 bg-gradient-to-r from-[#F97316] to-[#FB923C] border-none"
          onClick={(e) => handleNavigation(e, '/subscription')}
        >
          Оформить подписку за 1899₽
        </Button>
      </div>
    </div>
  );
};

export default HomePage; 