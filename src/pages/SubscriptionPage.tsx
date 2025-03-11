import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

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
      icon: '📚',
      description: 'Все материалы курса от регистрации до миллиона рублей'
    },
    {
      title: 'Библиотека шаблонов и фишек для продавцов',
      icon: '📋',
      description: 'Готовые шаблоны для быстрого старта и масштабирования'
    },
    {
      title: 'Доступ в закрытый Telegram-канал',
      icon: '💬',
      description: 'Общение с единомышленниками и обмен опытом'
    },
    {
      title: 'Обновления и новые материалы',
      icon: '🔄',
      description: 'Регулярные обновления с учетом изменений на маркетплейсе'
    },
    {
      title: 'Поддержка сообщества',
      icon: '👥',
      description: 'Помощь от опытных продавцов и наставников'
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

  const comparisonTable = [
    {
      feature: 'Доступ к первому модулю',
      free: true,
      premium: true
    },
    {
      feature: 'Базовые шаблоны (3 шт)',
      free: true,
      premium: true
    },
    {
      feature: 'Доступ ко всем 8 модулям',
      free: false,
      premium: true
    },
    {
      feature: 'Полная библиотека шаблонов (20+ шт)',
      free: false,
      premium: true
    },
    {
      feature: 'Закрытый Telegram-канал',
      free: false,
      premium: true
    },
    {
      feature: 'Кейсы успешных учеников',
      free: false,
      premium: true
    },
    {
      feature: 'Обновления материалов',
      free: false,
      premium: true
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
    <div className="flex flex-col items-center justify-center p-4 space-y-6 pb-44 animate-fade-in">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          leftIcon={<span className="text-lg">←</span>}
          className="mb-4"
        >
          Назад
        </Button>
        
        <h1 className="text-2xl font-bold text-center mb-2 animate-slide-in-right">
          Подписка на WB Simple
        </h1>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 animate-slide-in-right" style={{ animationDelay: '50ms' }}>
          Инвестируйте в свое будущее и начните зарабатывать на Wildberries
        </p>
        
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
                  <div>
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</div>
                  </div>
                </li>
              ))}
            </ul>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              Подписка автоматически продлевается каждый {selectedPlan === 'monthly' ? 'месяц' : 'год'}. Вы можете отменить её в любое время.
            </p>
          </div>
        </Card>
        
        {/* Сравнение бесплатного и премиум доступа */}
        <Card 
          variant="default" 
          className="mb-6 animate-slide-in-right" 
        >
          <div style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-semibold mb-4">Сравнение возможностей</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">Функция</th>
                    <th className="text-center py-2">Бесплатно</th>
                    <th className="text-center py-2">Премиум</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="py-3 text-sm">{item.feature}</td>
                      <td className="py-3 text-center">
                        {item.free ? 
                          <span className="text-green-500">✓</span> : 
                          <span className="text-red-500">✗</span>}
                      </td>
                      <td className="py-3 text-center">
                        {item.premium ? 
                          <span className="text-green-500">✓</span> : 
                          <span className="text-red-500">✗</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
        
        {/* Калькулятор прибыли */}
        <Card 
          variant="accent" 
          className="mb-6 animate-slide-in-right" 
        >
          <div style={{ animationDelay: '400ms' }}>
            <h3 className="text-lg font-semibold mb-2">Рассчитайте свою прибыль</h3>
            <p className="mb-4 text-sm">
              Узнайте, сколько вы можете заработать на Wildberries, применяя знания из курса
            </p>
            <Button 
              variant="secondary" 
              fullWidth
              onClick={() => navigate('/calculator')}
              rightIcon={<span>→</span>}
            >
              Открыть калькулятор прибыли
            </Button>
          </div>
        </Card>
        
        {/* Истории успеха */}
        <Card 
          variant="default" 
          className="animate-slide-in-right" 
        >
          <div style={{ animationDelay: '500ms' }}>
            <h3 className="text-lg font-semibold mb-2">Истории успеха наших учеников</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm italic mb-2">
                  "Благодаря курсу я вышел на доход 350 000 ₽ в месяц всего за 3 месяца работы с Wildberries"
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  — Алексей, продавец товаров для дома
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm italic mb-2">
                  "Курс помог мне разобраться во всех нюансах работы с маркетплейсом. Теперь у меня стабильный доход и свободный график"
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  — Мария, продавец косметики
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/success-stories')}
              >
                Больше историй успеха
              </Button>
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
          className="animate-pulse-subtle"
        >
          Оформить подписку за {selectedPlan === 'monthly' ? '999 ₽/месяц' : '9 990 ₽/год'}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPage; 