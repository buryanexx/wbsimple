import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

// Временные данные для модулей
const modulesData = [
  {
    id: 1,
    title: 'Регистрация на Wildberries',
    description: 'Как правильно зарегистрироваться на маркетплейсе и настроить личный кабинет',
    lessonsCount: 5,
    progress: 0,
    icon: '📝'
  },
  {
    id: 2,
    title: 'Выбор ниши и товара',
    description: 'Анализ рынка и выбор прибыльной ниши для старта',
    lessonsCount: 7,
    progress: 0,
    icon: '🔍'
  },
  {
    id: 3,
    title: 'Поиск поставщиков',
    description: 'Где и как найти надежных поставщиков для вашего бизнеса',
    lessonsCount: 6,
    progress: 0,
    icon: '🤝'
  },
  {
    id: 4,
    title: 'Создание карточек товаров',
    description: 'Как создать продающие карточки товаров на Wildberries',
    lessonsCount: 8,
    progress: 0,
    icon: '📊'
  },
  {
    id: 5,
    title: 'Логистика и поставки',
    description: 'Организация поставок товаров на склады Wildberries',
    lessonsCount: 5,
    progress: 0,
    icon: '🚚'
  },
  {
    id: 6,
    title: 'Аналитика и оптимизация',
    description: 'Анализ продаж и оптимизация карточек товаров',
    lessonsCount: 7,
    progress: 0,
    icon: '📈'
  },
  {
    id: 7,
    title: 'Реклама и продвижение',
    description: 'Стратегии продвижения товаров на Wildberries',
    lessonsCount: 6,
    progress: 0,
    icon: '📣'
  },
  {
    id: 8,
    title: 'Масштабирование бизнеса',
    description: 'Как расширить ассортимент и увеличить продажи',
    lessonsCount: 5,
    progress: 0,
    icon: '🚀'
  }
];

const ModulesPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();

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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-primary"
        >
          ← Назад
        </button>
        <h1 className="text-xl font-bold">Модули курса</h1>
        <div className="w-6"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      <div className="space-y-4">
        {modulesData.map((module) => (
          <div 
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            className={`tg-card flex items-start ${
              isModuleAvailable(module.id) 
                ? 'cursor-pointer' 
                : 'opacity-70 cursor-not-allowed'
            }`}
          >
            <div className="text-3xl mr-4">{module.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{module.title}</h2>
                {!isModuleAvailable(module.id) && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full">
                    Требуется подписка
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
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${module.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulesPage; 