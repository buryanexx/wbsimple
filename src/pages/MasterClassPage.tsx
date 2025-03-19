import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Button from '../components/Button';
import Card from '../components/Card';
import Icon from '../components/Icon';

// Интерфейс для мастер-класса
interface MasterClass {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  duration: string;
  speaker: {
    name: string;
    position: string;
    avatar: string;
  };
  isFree: boolean;
  registrationUrl: string;
  topics: string[];
}

// Данные о мастер-классах
const masterClassesData: MasterClass[] = [
  {
    id: 1,
    title: 'Как найти поставщика на Wildberries',
    description: 'На этом мастер-классе мы рассмотрим основные стратегии поиска надежных поставщиков для продажи на Wildberries и другие важные аспекты работы с ними.',
    imageUrl: 'https://via.placeholder.com/600x300',
    date: '15 июня 2024',
    time: '19:00',
    duration: '1,5 часа',
    speaker: {
      name: 'Анна Смирнова',
      position: 'Эксперт по закупкам',
      avatar: 'https://via.placeholder.com/100'
    },
    isFree: true,
    registrationUrl: 'https://t.me/wb_simple_bot',
    topics: [
      'Критерии выбора надежного поставщика',
      'Где искать поставщиков в 2024 году',
      'Как вести переговоры с производителями',
      'Проверка качества продукции',
      'Документы и договоренности'
    ]
  },
  {
    id: 2,
    title: 'Создание продающих карточек товаров',
    description: 'Мастер-класс по созданию эффективных карточек товаров, которые повышают конверсию и улучшают позиции в поиске на Wildberries.',
    imageUrl: 'https://via.placeholder.com/600x300',
    date: '22 июня 2024',
    time: '18:00',
    duration: '2 часа',
    speaker: {
      name: 'Михаил Петров',
      position: 'SEO-специалист маркетплейсов',
      avatar: 'https://via.placeholder.com/100'
    },
    isFree: false,
    registrationUrl: 'https://t.me/wb_simple_bot',
    topics: [
      'Структура идеальной карточки товара',
      'Ключевые слова и их размещение',
      'Оптимизация фотографий и описаний',
      'Работа с отзывами и рейтингом',
      'Инструменты аналитики эффективности'
    ]
  },
  {
    id: 3,
    title: 'Стратегии продвижения и рекламы на WB',
    description: 'Подробный разбор рекламных инструментов Wildberries и стратегий продвижения товаров для увеличения продаж.',
    imageUrl: 'https://via.placeholder.com/600x300',
    date: '29 июня 2024',
    time: '19:30',
    duration: '1,5 часа',
    speaker: {
      name: 'Елена Козлова',
      position: 'Маркетолог-практик',
      avatar: 'https://via.placeholder.com/100'
    },
    isFree: false,
    registrationUrl: 'https://t.me/wb_simple_bot',
    topics: [
      'Особенности рекламного кабинета WB',
      'Настройка поисковой рекламы',
      'Работа с автоматическими стратегиями',
      'Расчет эффективного рекламного бюджета',
      'Анализ рекламных кампаний'
    ]
  }
];

const MasterClassPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);
  const [visibleMasterClasses, setVisibleMasterClasses] = useState<number[]>([]);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Анимация появления мастер-классов
      masterClassesData.forEach((masterClass, index) => {
        setTimeout(() => {
          setVisibleMasterClasses(prev => [...prev, masterClass.id]);
        }, index * 200);
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Настраиваем кнопку Telegram
    if (webApp?.MainButton && !isLoading) {
      webApp.MainButton.setText('Подписаться на все мастер-классы');
      webApp.MainButton.show();
      webApp.MainButton.onClick(() => navigate('/subscription'));
    }
    
    return () => {
      // Скрываем кнопку при размонтировании компонента
      webApp?.MainButton?.hide();
    };
  }, [webApp, isLoading, navigate]);

  const handleRegistration = (masterClass: MasterClass, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (masterClass.isFree) {
      // Если мастер-класс бесплатный, открываем регистрацию
      window.open(masterClass.registrationUrl, '_blank');
    } else {
      // Если платный, предлагаем оформить подписку
      if (webApp) {
        webApp.showPopup({
          title: 'Требуется подписка',
          message: 'Для доступа к этому мастер-классу необходимо оформить подписку.',
          buttons: [
            { id: 'subscribe', type: 'default', text: 'Оформить подписку' },
            { id: 'cancel', type: 'cancel', text: 'Отмена' }
          ]
        }, (buttonId: string) => {
          if (buttonId === 'subscribe') {
            navigate('/subscription');
          }
        });
      } else {
        navigate('/subscription');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка мастер-классов...</p>
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
        <h1 className="text-xl font-bold">Мастер-классы</h1>
        <div className="w-10"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      <Card variant="primary" className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Онлайн мастер-классы от экспертов</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Практические занятия с экспертами по самым важным аспектам работы на Wildberries.
          С подпиской доступны все мастер-классы.
        </p>
      </Card>
      
      <div className="space-y-6 mb-8">
        {masterClassesData.map((masterClass, index) => (
          <div 
            key={masterClass.id}
            className={`transform transition-all duration-300 ${
              visibleMasterClasses.includes(masterClass.id) 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}
          >
            <Card 
              variant="default"
              className="hover:shadow-md overflow-hidden"
            >
              <div className="relative">
                <img 
                  src={masterClass.imageUrl} 
                  alt={masterClass.title} 
                  className="w-full h-40 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`text-xs py-1 px-2 rounded-full ${
                    masterClass.isFree 
                      ? 'bg-green-500 text-white' 
                      : 'bg-amber-500 text-white'
                  }`}>
                    {masterClass.isFree ? 'Бесплатно' : 'Премиум'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{masterClass.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {masterClass.description}
                </p>
                
                <div className="flex items-center mb-4">
                  <img 
                    src={masterClass.speaker.avatar} 
                    alt={masterClass.speaker.name} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{masterClass.speaker.name}</p>
                    <p className="text-xs text-gray-500">{masterClass.speaker.position}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{masterClass.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{masterClass.time}, {masterClass.duration}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Программа:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {masterClass.topics.map((topic, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  variant={masterClass.isFree ? "primary" : "accent"}
                  fullWidth
                  onClick={(e) => handleRegistration(masterClass, e)}
                >
                  {masterClass.isFree ? 'Зарегистрироваться' : 'Получить доступ'}
                </Button>
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
          Открыть доступ ко всем мастер-классам
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Подписка дает доступ ко всем мастер-классам и учебным материалам
        </p>
      </div>
    </div>
  );
};

export default MasterClassPage; 