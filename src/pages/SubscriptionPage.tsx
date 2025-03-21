import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { subscriptionsAPI } from '../services/api';
import { useSubscription } from '../hooks/useSubscription';

// Интерфейс для доступных планов подписки
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
}

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const { user } = useAuth();
  const { subscription, getFormattedEndDate, getDaysRemaining } = useSubscription();
  
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isPendingPayment, setIsPendingPayment] = useState(false);
  
  // Загрузка данных
  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        setIsLoading(true);
        
        // В реальном проекте здесь будет запрос доступных планов
        // const response = await subscriptionsAPI.getPlans();
        // setPlans(response.data.plans);
        
        // Пока используем примерные данные
        setPlans([
          {
            id: 'monthly',
            name: 'Ежемесячная подписка',
            price: 1899,
            period: 'месяц',
            description: 'Автоматически продлевается каждый месяц'
          },
          {
            id: 'annual',
            name: 'Годовая подписка',
            price: 14990,
            period: 'год',
            description: 'Экономия 40% от ежемесячной подписки'
          }
        ]);
        
        // Проверяем статус существующей подписки
        if (user) {
          try {
            const statusResponse = await subscriptionsAPI.getSubscriptionInfo();
            
            // Если есть какой-то незавершенный платеж, можем это обработать
            if (statusResponse.data.pendingPayment) {
              setIsPendingPayment(true);
              setPaymentUrl(statusResponse.data.resumePaymentUrl || null);
            }
          } catch (statusError) {
            console.error('Ошибка при получении информации о подписке:', statusError);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных о подписке:', error);
        setError('Не удалось загрузить информацию о планах подписки');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscriptionData();
  }, [user]);

  // Настраиваем кнопку Telegram
  useEffect(() => {
    if (webApp?.MainButton && !isLoading) {
      if (subscription.isActive) {
        webApp.MainButton.setText('Управление подпиской');
      } else {
        webApp.MainButton.setText('Оформить подписку');
      }
      
      webApp.MainButton.show();
      webApp.MainButton.onClick(() => {
        if (subscription.isActive) {
          // Показываем опции управления подпиской
          webApp.showPopup({
            title: 'Управление подпиской',
            message: 'Что вы хотите сделать с текущей подпиской?',
            buttons: [
              { id: 'cancel', type: 'destructive', text: 'Отключить автопродление' },
              { id: 'close', type: 'cancel', text: 'Закрыть' }
            ]
          }, (buttonId) => {
            if (buttonId === 'cancel') {
              handleCancelSubscription();
            }
          });
        } else {
          // Показываем окно выбора плана
          showSubscriptionPlans();
        }
      });
    }
    
    return () => {
      // Скрываем кнопку при размонтировании компонента
      webApp?.MainButton?.hide();
    };
  }, [webApp, isLoading, subscription]);
  
  // Показываем окно выбора плана подписки
  const showSubscriptionPlans = () => {
    if (!webApp?.showPopup) return;
    
    const buttons = plans.map(plan => ({
      id: plan.id,
      type: 'default' as const,
      text: `${plan.name} - ${plan.price} ₽`
    }));
    
    buttons.push({ id: 'cancel', type: 'default' as const, text: 'Отмена' });
    
    webApp.showPopup({
      title: 'Выберите план подписки',
      message: 'Выберите подходящий для вас план подписки',
      buttons
    }, (buttonId) => {
      if (buttonId !== 'cancel') {
        handleSubscribe(buttonId);
      }
    });
  };

  // Обработка оформления подписки
  const handleSubscribe = async (planId: string) => {
    try {
      setIsLoading(true);
      
      // Получаем URL для оплаты
      const response = await subscriptionsAPI.getPaymentUrl(planId);
      
      if (response.data && response.data.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl);
        
        // Открываем страницу оплаты в Telegram
        if (webApp?.openLink) {
          webApp.openLink(response.data.paymentUrl);
        } else {
          // Запасной вариант - открываем в новом окне
          window.open(response.data.paymentUrl, '_blank');
        }
      } else {
        throw new Error('Не удалось получить ссылку для оплаты');
      }
    } catch (error) {
      console.error('Ошибка при оформлении подписки:', error);
      
      if (webApp?.showPopup) {
        webApp.showPopup({
          title: 'Ошибка',
          message: 'Не удалось оформить подписку. Пожалуйста, попробуйте позже.',
          buttons: [{ id: 'ok', type: 'ok', text: 'OK' }]
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Отмена автопродления подписки
  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      
      await subscriptionsAPI.cancelAutoRenewal();
      
      // Показываем уведомление об успешной отмене
      if (webApp?.showPopup) {
        webApp.showPopup({
          title: 'Успешно',
          message: 'Автопродление подписки отключено. Вы можете пользоваться подпиской до окончания оплаченного периода.',
          buttons: [{ id: 'ok', type: 'ok', text: 'OK' }]
        });
      }
      
      // Обновляем информацию о пользователе
      if (user) {
        // В реальном проекте здесь будет обновление данных пользователя
      }
    } catch (error) {
      console.error('Ошибка при отмене подписки:', error);
      
      if (webApp?.showPopup) {
        webApp.showPopup({
          title: 'Ошибка',
          message: 'Не удалось отменить подписку. Пожалуйста, попробуйте позже.',
          buttons: [{ id: 'ok', type: 'ok', text: 'OK' }]
        });
      }
    } finally {
      setIsLoading(false);
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
        <div className="w-16 h-16 border-4 border-[#6A45E8] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка информации о подписке...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-red-500 font-medium mb-2">{error}</p>
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          leftIcon={<span className="text-lg">←</span>}
        >
          Назад
        </Button>
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
        
        {/* Текущая подписка */}
        {subscription.isActive && (
          <Card variant="primary" className="mb-6 animate-slide-in-right bg-green-500/10 text-green-800">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                <span className="mr-2">✓</span> Активная подписка
              </h2>
              <div className="mt-2 space-y-1">
                <p>Период: <span className="font-medium">Премиум</span></p>
                <p>Действует до: <span className="font-medium">{getFormattedEndDate()}</span></p>
                <p>Осталось дней: <span className="font-medium">{getDaysRemaining()}</span></p>
                <p>Автопродление: <span className="font-medium">{subscription.autoRenewal ? 'Включено' : 'Отключено'}</span></p>
              </div>
              <div className="mt-4">
                <Button
                  variant={subscription.autoRenewal ? "secondary" : "primary"}
                  className="w-full"
                  onClick={() => subscription.autoRenewal ? handleCancelSubscription() : null}
                >
                  {subscription.autoRenewal ? 'Отключить автопродление' : 'Автопродление отключено'}
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        <h1 className="text-2xl font-bold text-center mb-2 animate-slide-in-right text-[#6A45E8]">
          {subscription.isActive ? 'Управление подпиской' : 'Подписка на WB Simple'}
        </h1>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 animate-slide-in-right" style={{ animationDelay: '50ms' }}>
          {subscription.isActive 
            ? 'Управляйте своей подпиской и настройками оплаты' 
            : 'Инвестируйте в свое будущее и начните зарабатывать на Wildberries'}
        </p>
        
        {/* Карточки планов подписки */}
        {!subscription.isActive && plans.map((plan, index) => (
          <Card 
            key={plan.id}
            variant="primary" 
            className={`mb-4 animate-slide-in-right ${
              plan.id === 'annual' 
                ? 'bg-gradient-to-r from-[#6A45E8]/10 to-[#8A65FF]/10 border-[#6A45E8]' 
                : 'bg-white'
            }`}
          >
            <div style={{ animationDelay: `${100 * index}ms` }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {plan.name}
                  {plan.id === 'annual' && (
                    <span className="ml-2 text-xs bg-[#6A45E8] text-white px-2 py-1 rounded-full">
                      Выгодно
                    </span>
                  )}
                </h2>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#6A45E8]">
                    {plan.price} ₽
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    за {plan.period}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                {plan.description}
              </div>
              
              <Button
                variant="primary"
                fullWidth
                className={`${plan.id === 'annual' ? 'bg-gradient-to-r from-[#6A45E8] to-[#8A65FF] border-none' : ''}`}
                onClick={() => handleSubscribe(plan.id)}
              >
                Оформить подписку
              </Button>
            </div>
          </Card>
        ))}
        
        {/* Содержимое подписки */}
        {!subscription.isActive && (
          <Card 
            variant="primary" 
            className="mb-6 animate-slide-in-right bg-gradient-to-r from-[#6A45E8]/10 to-[#8A65FF]/10" 
          >
            <div style={{ animationDelay: '200ms' }}>
              <h3 className="text-lg font-semibold mb-4 text-[#6A45E8]">Что входит в подписку</h3>
              
              <ul className="space-y-3 mb-4">
                {subscriptionFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start animate-slide-in-right" style={{ animationDelay: `${300 + index * 100}ms` }}>
                    <div className="bg-[#6A45E8]/10 text-[#6A45E8] rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-0.5">
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
                Подписка автоматически продлевается каждый месяц. Вы можете отменить её в любое время.
              </p>
            </div>
          </Card>
        )}
        
        {/* Сравнение бесплатного и премиум доступа */}
        {!subscription.isActive && (
          <Card 
            variant="default" 
            className="mb-6 animate-slide-in-right" 
          >
            <div style={{ animationDelay: '300ms' }}>
              <h3 className="text-lg font-semibold mb-4 text-[#6A45E8]">Сравнение возможностей</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2">Функция</th>
                      <th className="text-center py-2">Бесплатно</th>
                      <th className="text-center py-2 text-[#6A45E8]">Премиум</th>
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
                            <span className="text-[#6A45E8]">✓</span> : 
                            <span className="text-red-500">✗</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
        
        {/* Истории успеха */}
        <div style={{ animationDelay: '500ms' }}>
          <Card 
            variant="default" 
            className="animate-slide-in-right" 
          >
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#6A45E8]">Истории успеха наших учеников</h3>
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
              {!subscription.isActive && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="bg-gradient-to-r from-[#6A45E8] to-[#8A65FF] border-none"
                    onClick={() => showSubscriptionPlans()}
                  >
                    Оформить подписку
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage; 