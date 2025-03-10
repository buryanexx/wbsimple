import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

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
    popularity: 85
  },
  {
    id: 2,
    title: 'Скрипт для переговоров с поставщиками',
    description: 'Готовый скрипт для ведения переговоров с поставщиками и получения лучших условий',
    category: 'Скрипты',
    downloadUrl: '#',
    isPremium: true,
    popularity: 92
  },
  {
    id: 3,
    title: 'Таблица для расчета маржинальности',
    description: 'Excel-таблица для расчета маржинальности товаров с учетом всех комиссий Wildberries',
    category: 'Таблицы',
    downloadUrl: '#',
    isPremium: true,
    popularity: 78
  },
  {
    id: 4,
    title: 'Чек-лист проверки карточки товара',
    description: 'Подробный чек-лист для проверки карточки товара перед публикацией',
    category: 'Чек-листы',
    downloadUrl: '#',
    isPremium: false,
    popularity: 65
  },
  {
    id: 5,
    title: 'Шаблон для SEO-оптимизации',
    description: 'Шаблон для оптимизации заголовков и описаний товаров для лучшего ранжирования',
    category: 'Карточки товаров',
    downloadUrl: '#',
    isPremium: true,
    popularity: 88
  }
];

// Категории шаблонов
const categories = ['Все', 'Карточки товаров', 'Скрипты', 'Таблицы', 'Чек-листы'];

const TemplatesPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [activeCategory, setActiveCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-primary"
        >
          ← Назад
        </button>
        <h1 className="text-xl font-bold">Шаблоны и фишки</h1>
        <div className="w-6"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      {/* Поиск */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск шаблонов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="tg-input"
        />
      </div>
      
      {/* Фильтр по категориям */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
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
          filteredTemplates.map((template) => (
            <div key={template.id} className="tg-card">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">{template.title}</h2>
                {template.isPremium && (
                  <span className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full">
                    Премиум
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {template.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {template.category} • Популярность: {template.popularity}%
                </span>
                <button
                  onClick={() => handleDownload(template)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    template.isPremium
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      : 'bg-primary text-white'
                  }`}
                >
                  {template.isPremium ? 'Требуется подписка' : 'Скачать'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Шаблоны не найдены. Попробуйте изменить параметры поиска.
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage; 