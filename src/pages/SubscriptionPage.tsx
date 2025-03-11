import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Настраиваем кнопку Telegram
    if (webApp?.MainButton && !isLoading) {
      webApp.MainButton.setText('Оформить подписку');
      webApp.MainButton.show();
      webApp.MainButton.onClick(handleSubscribe);
    }
    
    return () => {
      // Скрываем кнопку при размонтировании компонента
      webApp?.MainButton?.hide();
    };
  }, [webApp, isLoading, selectedPlan]);

  const handleSubscribe = () => {
    // В реальном приложении здесь будет интеграция с Telegram Payments
    // Для демонстрации просто показываем уведомление
    if (webApp) {
      webApp.showPopup({
        title: 'Оформление подписки',
        message: `В реальном приложении здесь будет интеграция с Telegram Payments API для оформления ${selectedPlan === 'monthly' ? 'ежемесячной' : 'годовой'} подписки.`,
        buttons: [
          { id: 'ok', type: 'ok', text: 'Понятно' }
        ]
      });
    }
  };

  const subscriptionFeatures = [
    {
      title: 'Полный доступ ко всем 8 модулям курса',
      icon: '📚'
    },
    {
      title: 'Библиотека шаблонов и фишек для продавцов',
      icon: '📋'
    },
    {
      title: 'Доступ в закрытый Telegram-канал',
      icon: '💬'
    },
    {
      title: 'Обновления и новые материалы',
      icon: '🔄'
    },
    {
      title: 'Поддержка сообщества',
      icon: '👥'
    }
  ];

  const plans = [
    {
      id: 'monthly',
      title: 'Ежемесячная',
      price: 999,
      period: 'месяц',
      discount: null,
      popular: false
    },
    {
      id: 'yearly',
      title: 'Годовая',
      price: 9990,
      period: 'год',
      discount: '17%',
      popular: true
    }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка информации о подписке...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6 pb-36 animate-fade-in">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          leftIcon={<span className="text-lg">←</span>}
          className="mb-4"
        >
          Назад
        </Button>
        
        <h1 className="text-2xl font-bold text-center mb-6 animate-slide-in-right">
          Подписка на WB Simple
        </h1>
        
        {/* Переключатель планов */}
        <div className="flex justify-center mb-6 animate-slide-in-right" style={{ animationDelay: '100ms' }}>
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as 'monthly' | 'yearly')}
                className={`px-4 py-2 rounded-md transition-all duration-200 relative ${
                  selectedPlan === plan.id 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                {plan.title}
                {plan.discount && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                    -{plan.discount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Карточка плана */}
        <Card 
          variant="primary" 
          className="mb-6 animate-slide-in-right" 
        >
          <div style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedPlan === 'monthly' ? 'Ежемесячная подписка' : 'Годовая подписка'}
              </h2>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  {selectedPlan === 'monthly' ? '999 ₽' : '9 990 ₽'}
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  за {selectedPlan === 'monthly' ? 'месяц' : 'год'}
                </div>
              </div>
            </div>
            
            <ul className="space-y-3 mb-4">
              {subscriptionFeatures.map((feature, index) => (
                <li key={index} className="flex items-start animate-slide-in-right" style={{ animationDelay: `${300 + index * 100}ms` }}>
                  <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-0.5">
                    <span>{feature.icon}</span>
                  </div>
                  <span className="pt-1">{feature.title}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              Подписка автоматически продлевается каждый {selectedPlan === 'monthly' ? 'месяц' : 'год'}. Вы можете отменить её в любое время.
            </p>
          </div>
        </Card>
        
        {/* Дополнительная информация */}
        <Card 
          variant="accent" 
          className="animate-slide-in-right" 
        >
          <div style={{ animationDelay: '400ms' }}>
            <h3 className="text-lg font-semibold mb-2">Что вы получаете с подпиской:</h3>
            <p className="mb-4">
              Полный доступ к образовательной платформе, которая поможет вам начать зарабатывать на Wildberries с нуля и дойти до 1.000.000 рублей.
            </p>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="mr-2">🔒</span>
              <span>Оплата производится через Telegram Payments. Ваши данные надежно защищены.</span>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="accent" 
          size="lg"
          fullWidth
          onClick={handleSubscribe}
        >
          Оформить подписку за {selectedPlan === 'monthly' ? '999 ₽/месяц' : '9 990 ₽/год'}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPage; 