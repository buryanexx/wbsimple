import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

const TimelinePage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Настройка кнопки "Назад" в Telegram WebApp
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => {
        navigate(-1);
      });
    }

    return () => {
      webApp?.BackButton?.hide();
    };
  }, [webApp, isLoading, navigate]);

  const timelineSteps = [
    {
      title: 'Регистрация на Wildberries',
      duration: '1-2 дня',
      description: 'Создание личного кабинета, подготовка документов, заключение договора',
      tips: 'Подготовьте все документы заранее для ускорения процесса'
    },
    {
      title: 'Анализ рынка и выбор ниши',
      duration: '7-14 дней',
      description: 'Исследование спроса, анализ конкурентов, выбор прибыльной ниши',
      tips: 'Используйте аналитические инструменты для оценки спроса и конкуренции'
    },
    {
      title: 'Поиск поставщиков',
      duration: '14-30 дней',
      description: 'Поиск надежных поставщиков в России или Китае, переговоры, заключение договоров',
      tips: 'Запросите образцы товаров перед крупным заказом'
    },
    {
      title: 'Ожидание поставки товара',
      duration: '7-60 дней',
      description: 'Ожидание поставки товара от поставщика (зависит от страны производства)',
      tips: 'Из Китая доставка занимает 30-60 дней, из России - 7-14 дней'
    },
    {
      title: 'Подготовка товара к отправке',
      duration: '3-7 дней',
      description: 'Проверка качества, маркировка, упаковка товара',
      tips: 'Следуйте инструкциям Wildberries по маркировке, чтобы избежать штрафов'
    },
    {
      title: 'Создание карточек товаров',
      duration: '3-7 дней',
      description: 'Фотосъемка, написание описаний, загрузка в личный кабинет',
      tips: 'Качественные фото и SEO-оптимизированные описания увеличивают продажи'
    },
    {
      title: 'Отправка товаров на склад WB',
      duration: '1-3 дня',
      description: 'Подготовка поставки, отправка на склад Wildberries',
      tips: 'Используйте транспортные компании, рекомендованные Wildberries'
    },
    {
      title: 'Приемка товара на складе',
      duration: '3-7 дней',
      description: 'Проверка и приемка товара на складе Wildberries',
      tips: 'Следите за статусом приемки в личном кабинете'
    },
    {
      title: 'Начало продаж',
      duration: '1-14 дней после приемки',
      description: 'Появление товаров в каталоге, начало продаж',
      tips: 'Первые продажи могут начаться уже в день появления товара в каталоге'
    },
    {
      title: 'Первые выплаты',
      duration: '7-14 дней после первых продаж',
      description: 'Получение первых выплат от Wildberries',
      tips: 'Выплаты происходят еженедельно по средам'
    },
    {
      title: 'Масштабирование бизнеса',
      duration: '30+ дней',
      description: 'Расширение ассортимента, увеличение объемов, оптимизация процессов',
      tips: 'Реинвестируйте прибыль в развитие бизнеса для быстрого роста'
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8 pb-44">
      <h1 className="text-2xl font-bold mb-6">Таймлайн запуска бизнеса на Wildberries</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <p className="mb-4">
          Ниже представлен примерный таймлайн запуска бизнеса на Wildberries. 
          Сроки могут варьироваться в зависимости от категории товара, поставщика и других факторов.
        </p>
        
        <div className="space-y-4">
          {timelineSteps.map((step, index) => (
            <div key={index} className="border-l-4 border-primary pl-4 py-2">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold">{step.title}</h3>
                <span className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded text-sm">
                  {step.duration}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{step.description}</p>
              <p className="text-xs italic text-gray-500 dark:text-gray-400">{step.tips}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">Общий срок запуска бизнеса:</h3>
          <p>
            <span className="font-medium">Минимальный срок:</span> 40-60 дней (при работе с российскими поставщиками)
          </p>
          <p>
            <span className="font-medium">Средний срок:</span> 90-120 дней (при работе с китайскими поставщиками)
          </p>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
            * Сроки указаны от момента регистрации на Wildberries до получения первых выплат
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage; 