import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

// Типы для шаблонов
interface Template {
  id: number;
  title: string;
  description: string;
  category: string;
  downloadUrl: string;
  previewUrl?: string;
  isPremium: boolean;
  popularity: number;
  icon: string;
}

// Моковые данные для шаблонов
const templatesData: Template[] = [
  {
    id: 1,
    title: 'Шаблон карточки товара',
    description: 'Базовый шаблон для создания продающей карточки товара на Wildberries',
    category: 'Карточки товаров',
    downloadUrl: '#',
    isPremium: false,
    popularity: 85,
    icon: '📋'
  },
  {
    id: 2,
    title: 'Скрипт для переговоров с поставщиками',
    description: 'Готовый скрипт для ведения переговоров с поставщиками и получения лучших условий',
    category: 'Скрипты',
    downloadUrl: '#',
    isPremium: true,
    popularity: 92,
    icon: '🗣️'
  },
  {
    id: 3,
    title: 'Таблица для расчета маржинальности',
    description: 'Excel-таблица для расчета маржинальности товаров с учетом всех комиссий Wildberries',
    category: 'Таблицы',
    downloadUrl: '#',
    isPremium: true,
    popularity: 78,
    icon: '📊'
  },
  {
    id: 4,
    title: 'Чек-лист проверки карточки товара',
    description: 'Подробный чек-лист для проверки карточки товара перед публикацией',
    category: 'Чек-листы',
    downloadUrl: '#',
    isPremium: false,
    popularity: 65,
    icon: '✅'
  },
  {
    id: 5,
    title: 'Шаблон для SEO-оптимизации',
    description: 'Шаблон для оптимизации заголовков и описаний товаров для лучшего ранжирования',
    category: 'Карточки товаров',
    downloadUrl: '#',
    isPremium: true,
    popularity: 88,
    icon: '🔍'
  }
];

// Категории шаблонов
const categories = ['Все', 'Карточки товаров', 'Скрипты', 'Таблицы', 'Чек-листы'];

const TemplatesPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [activeCategory, setActiveCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [visibleTemplates, setVisibleTemplates] = useState<number[]>([]);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Постепенно показываем шаблоны с анимацией
      const showTemplates = async () => {
        const filtered = filteredTemplates.map(t => t.id);
        setVisibleTemplates([]);
        
        for (let i = 0; i < filtered.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setVisibleTemplates(prev => [...prev, filtered[i]]);
        }
      };
      
      showTemplates();
    }
  }, [isLoading, activeCategory, searchQuery]);

  const handleDownload = (template: Template) => {
    if (template.isPremium) {
      // Показываем уведомление о необходимости подписки
      if (webApp) {
        webApp.showPopup({
          title: 'Требуется подписка',
          message: 'Для скачивания этого шаблона необходимо оформить подписку.',
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
    } else {
      // В реальном приложении здесь будет скачивание файла
      // Для демонстрации просто показываем уведомление
      if (webApp) {
        webApp.showPopup({
          title: 'Скачивание шаблона',
          message: 'В реальном приложении здесь будет скачивание файла шаблона.',
          buttons: [
            { id: 'ok', type: 'ok', text: 'Понятно' }
          ]
        });
      }
    }
  };

  // Фильтрация шаблонов по категории и поисковому запросу
  const filteredTemplates = templatesData.filter(template => {
    const matchesCategory = activeCategory === 'Все' || template.category === activeCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка шаблонов...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          leftIcon={<span className="text-lg">←</span>}
        >
          Назад
        </Button>
        <h1 className="text-xl font-bold">Шаблоны и фишки</h1>
        <div className="w-10"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      {/* Поиск */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск шаблонов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Фильтр по категориям */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Список шаблонов */}
      <div className="space-y-4">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template, index) => (
            <div 
              key={template.id}
              className={`transform transition-all duration-300 ${
                visibleTemplates.includes(template.id) 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card 
                variant={template.isPremium ? 'accent' : 'default'}
                className="hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    template.isPremium 
                      ? 'bg-accent text-white' 
                      : 'bg-primary text-white'
                  }`}>
                    <span className="text-xl">{template.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-semibold">{template.title}</h2>
                      {template.isPremium && (
                        <span className="text-xs bg-accent/10 text-accent py-1 px-2 rounded-full flex items-center">
                          <span className="mr-1">✨</span>
                          Премиум
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                          {template.category}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-0.5 px-1.5 rounded-full">
                          Популярность: {template.popularity}%
                        </span>
                      </div>
                      <Button
                        variant={template.isPremium ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleDownload(template)}
                        leftIcon={template.isPremium ? <span>🔒</span> : <span>⬇️</span>}
                      >
                        {template.isPremium ? 'Премиум' : 'Скачать'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 animate-fade-in">
            <div className="text-5xl mb-4">🔍</div>
            <p className="mb-2">Шаблоны не найдены</p>
            <p className="text-sm">Попробуйте изменить параметры поиска</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('Все');
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
      
      {/* Кнопка подписки */}
      {filteredTemplates.some(t => t.isPremium) && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="accent" 
            size="lg"
            fullWidth
            onClick={() => navigate('/subscription')}
          >
            Получить доступ ко всем шаблонам
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage; 