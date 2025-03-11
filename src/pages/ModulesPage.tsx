import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';

// Временные данные для модулей
const modulesData = [
  {
    id: 1,
    title: 'Регистрация на Wildberries',
    description: 'Как правильно зарегистрироваться на маркетплейсе и настроить личный кабинет',
    lessonsCount: 5,
    progress: 20,
    icon: '📝',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Выбор ниши и товара',
    description: 'Анализ рынка и выбор прибыльной ниши для старта',
    lessonsCount: 7,
    progress: 10,
    icon: '🔍',
    color: 'bg-green-500'
  },
  {
    id: 3,
    title: 'Поиск поставщиков',
    description: 'Где и как найти надежных поставщиков для вашего бизнеса',
    lessonsCount: 6,
    progress: 0,
    icon: '🤝',
    color: 'bg-yellow-500'
  },
  {
    id: 4,
    title: 'Создание карточек товаров',
    description: 'Как создать продающие карточки товаров на Wildberries',
    lessonsCount: 8,
    progress: 0,
    icon: '📊',
    color: 'bg-purple-500'
  },
  {
    id: 5,
    title: 'Логистика и поставки',
    description: 'Организация поставок товаров на склады Wildberries',
    lessonsCount: 5,
    progress: 0,
    icon: '🚚',
    color: 'bg-red-500'
  },
  {
    id: 6,
    title: 'Аналитика и оптимизация',
    description: 'Анализ продаж и оптимизация карточек товаров',
    lessonsCount: 7,
    progress: 0,
    icon: '📈',
    color: 'bg-indigo-500'
  },
  {
    id: 7,
    title: 'Реклама и продвижение',
    description: 'Стратегии продвижения товаров на Wildberries',
    lessonsCount: 6,
    progress: 0,
    icon: '📣',
    color: 'bg-pink-500'
  },
  {
    id: 8,
    title: 'Масштабирование бизнеса',
    description: 'Как расширить ассортимент и увеличить продажи',
    lessonsCount: 5,
    progress: 0,
    icon: '🚀',
    color: 'bg-teal-500'
  }
];

const ModulesPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);
  const [visibleModules, setVisibleModules] = useState<number[]>([]);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Постепенно показываем модули с анимацией
      const showModules = async () => {
        for (let i = 0; i < modulesData.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setVisibleModules(prev => [...prev, modulesData[i].id]);
        }
      };
      
      showModules();
    }
  }, [isLoading]);

  // Функция для проверки, доступен ли модуль (для демонстрации)
  const isModuleAvailable = (moduleId: number) => {
    // В реальном приложении здесь будет проверка статуса подписки
    return moduleId <= 2; // Для демонстрации доступны только первые 2 модуля
  };

  const handleModuleClick = (moduleId: number) => {
    if (isModuleAvailable(moduleId)) {
      // Переход к урокам модуля
      navigate(`/lesson/${moduleId}/1`);
    } else {
      // Показываем уведомление о необходимости подписки
      if (webApp) {
        webApp.showPopup({
          title: 'Требуется подписка',
          message: 'Для доступа к этому модулю необходимо оформить подписку.',
          buttons: [
            { id: 'subscribe', type: 'default', text: 'Оформить подписку' },
            { id: 'cancel', type: 'cancel', text: 'Отмена' }
          ]
        }, (buttonId: string) => {
          if (buttonId === 'subscribe') {
            navigate('/subscription');
          }
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка модулей...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-44">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          leftIcon={<span className="text-lg">←</span>}
        >
          Назад
        </Button>
        <h1 className="text-xl font-bold">Модули курса</h1>
        <div className="w-10"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      <div className="space-y-4">
        {modulesData.map((module, index) => (
          <div 
            key={module.id}
            className={`transform transition-all duration-300 ${
              visibleModules.includes(module.id) 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <Card 
              variant={isModuleAvailable(module.id) ? 'default' : 'outline'}
              className={`${
                isModuleAvailable(module.id) 
                  ? 'hover:shadow-md' 
                  : 'opacity-70'
              }`}
              onClick={isModuleAvailable(module.id) ? () => handleModuleClick(module.id) : undefined}
            >
              <div className="flex items-start">
                <div className={`text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 ${module.color}`}>
                  <span className="text-xl">{module.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{module.title}</h2>
                    {!isModuleAvailable(module.id) && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full">
                        🔒 Требуется подписка
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{module.lessonsCount} уроков</span>
                    <span>{module.progress}% завершено</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-1000 ${module.color}`}
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button 
          variant="accent" 
          size="lg"
          onClick={() => navigate('/subscription')}
        >
          Открыть все модули
        </Button>
      </div>
    </div>
  );
};

export default ModulesPage; 