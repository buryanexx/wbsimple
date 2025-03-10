import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();

  useEffect(() => {
    // Настраиваем кнопку Telegram
    if (webApp?.MainButton) {
      webApp.MainButton.setText('Оформить подписку');
      webApp.MainButton.show();
      webApp.MainButton.onClick(handleSubscribe);
    }
    
    return () => {
      // Скрываем кнопку при размонтировании компонента
      webApp?.MainButton?.hide();
    };
  }, [webApp]);

  const handleSubscribe = () => {
    // В реальном приложении здесь будет интеграция с Telegram Payments
    // Для демонстрации просто показываем уведомление
    if (webApp) {
      webApp.showPopup({
        title: 'Оформление подписки',
        message: 'В реальном приложении здесь будет интеграция с Telegram Payments API для оформления подписки.',
        buttons: [
          { id: 'ok', type: 'ok', text: 'Понятно' }
        ]
      });
    }
  };

  const subscriptionFeatures = [
    'Полный доступ ко всем 8 модулям курса',
    'Библиотека шаблонов и фишек для продавцов',
    'Доступ в закрытый Telegram-канал',
    'Обновления и новые материалы',
    'Поддержка сообщества'
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-primary mb-4"
        >
          ← Назад
        </button>
        
        <h1 className="text-2xl font-bold text-center mb-6">
          Подписка на WB Simple
        </h1>
        
        <div className="tg-card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Ежемесячная подписка</h2>
            <span className="text-2xl font-bold text-primary">999 ₽</span>
          </div>
          
          <ul className="space-y-2 mb-4">
            {subscriptionFeatures.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-primary mr-2">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Подписка автоматически продлевается каждый месяц. Вы можете отменить её в любое время.
          </p>
        </div>
        
        <div className="tg-card bg-gray-50 dark:bg-gray-800 border border-primary">
          <h3 className="text-lg font-semibold mb-2">Что вы получаете с подпиской:</h3>
          <p className="mb-4">
            Полный доступ к образовательной платформе, которая поможет вам начать зарабатывать на Wildberries с нуля и дойти до 1.000.000 рублей.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Оплата производится через Telegram Payments. Ваши данные надежно защищены.
          </p>
        </div>
      </div>
      
      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
        <button 
          onClick={handleSubscribe} 
          className="tg-button-accent"
        >
          Оформить подписку за 999 ₽/месяц
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPage; 