import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';

interface SuccessStory {
  id: number;
  name: string;
  avatar: string;
  category: string;
  revenue: string;
  period: string;
  quote: string;
  fullStory: string;
}

const SuccessStoriesPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStory, setExpandedStory] = useState<number | null>(null);

  // Примеры историй успеха
  const successStories: SuccessStory[] = [
    {
      id: 1,
      name: 'Алексей',
      avatar: '👨‍💼',
      category: 'Товары для дома',
      revenue: '350 000 ₽',
      period: '3 месяца',
      quote: 'Благодаря курсу я вышел на доход 350 000 ₽ в месяц всего за 3 месяца работы с Wildberries',
      fullStory: 'До курса я работал менеджером в строительной компании с зарплатой 80 000 ₽. Решил попробовать продажи на маркетплейсах как подработку. Начал с товаров для дома, так как сам часто сталкивался с проблемой поиска качественных товаров в этой категории.\n\nПервый месяц был сложным - много ошибок, неправильные закупки, проблемы с поставщиками. Но благодаря структурированным знаниям из курса и поддержке сообщества, я быстро исправил ошибки.\n\nУже через 3 месяца мой доход составил 350 000 ₽ в месяц. Сейчас я полностью ушел с основной работы и развиваю свой бизнес на Wildberries.'
    },
    {
      id: 2,
      name: 'Мария',
      avatar: '👩‍💼',
      category: 'Косметика',
      revenue: '280 000 ₽',
      period: '4 месяца',
      quote: 'Курс помог мне разобраться во всех нюансах работы с маркетплейсом. Теперь у меня стабильный доход и свободный график',
      fullStory: 'Я всегда интересовалась косметикой и мечтала о своем бизнесе в этой сфере. Wildberries казался хорошей площадкой для старта, но я боялась высокой конкуренции в нише косметики.\n\nКурс дал мне понимание, как выделиться среди конкурентов. Я нашла свою нишу - натуральная косметика для чувствительной кожи - и сделала акцент на качестве описаний и фотографий.\n\nЧерез 4 месяца мой ежемесячный доход достиг 280 000 ₽. Самое ценное - это свобода, которую я получила. Теперь я могу работать из любой точки мира и уделять больше времени семье.'
    },
    {
      id: 3,
      name: 'Дмитрий',
      avatar: '👨‍💻',
      category: 'Электроника',
      revenue: '520 000 ₽',
      period: '6 месяцев',
      quote: 'От нуля до полумиллиона за полгода - это реально, если следовать системе из курса и не бояться экспериментировать',
      fullStory: 'До Wildberries я перепробовал много способов заработка в интернете, но везде требовались большие вложения или специальные навыки. Решил попробовать продажи на маркетплейсе, так как порог входа казался ниже.\n\nНачал с небольших аксессуаров для смартфонов, постепенно расширяя ассортимент. Ключевым моментом стало применение стратегии работы с поставщиками из курса - я смог договориться о выгодных условиях и отсрочке платежа.\n\nЧерез 6 месяцев мой оборот достиг 520 000 ₽ в месяц. Сейчас у меня команда из 3 человек, и мы продолжаем расти. Планирую выйти на оборот в 1 миллион рублей к концу года.'
    },
    {
      id: 4,
      name: 'Елена',
      avatar: '👩‍🎨',
      category: 'Товары для творчества',
      revenue: '180 000 ₽',
      period: '3 месяца',
      quote: 'Превратила хобби в прибыльный бизнес благодаря правильному позиционированию и маркетинговым стратегиям из курса',
      fullStory: 'Я всегда увлекалась рукоделием и часто делала подарки друзьям своими руками. Многие советовали мне продавать свои изделия, но я не знала, с чего начать.\n\nКурс дал мне понимание, как организовать бизнес-процессы и масштабировать производство. Я начала с небольшой линейки наборов для творчества, постепенно добавляя новые позиции.\n\nЧерез 3 месяца мой доход составил 180 000 ₽. Это не самая большая сумма по сравнению с другими учениками, но для меня это огромное достижение - я зарабатываю на любимом деле больше, чем на предыдущей работе офис-менеджером.'
    },
    {
      id: 5,
      name: 'Сергей',
      avatar: '👨‍🦰',
      category: 'Спортивные товары',
      revenue: '420 000 ₽',
      period: '5 месяцев',
      quote: 'Нашел свою нишу в спортивных товарах и вышел на стабильный доход, несмотря на высокую конкуренцию',
      fullStory: 'Я профессиональный тренер по фитнесу, и часто сталкивался с проблемой поиска качественного спортивного инвентаря для клиентов. Решил сам заняться поставками на Wildberries.\n\nНачал с небольшой линейки товаров для домашних тренировок. Благодаря курсу я понял, как правильно составлять карточки товаров и оптимизировать их для поиска. Моим преимуществом стали подробные описания с рекомендациями по использованию от профессионального тренера.\n\nЧерез 5 месяцев мой ежемесячный доход достиг 420 000 ₽. Сейчас я развиваю собственный бренд спортивных товаров и планирую выход на другие маркетплейсы.'
    }
  ];

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
      webApp.MainButton.setText('Начать свою историю успеха');
      webApp.MainButton.show();
      webApp.MainButton.onClick(() => navigate('/subscription'));
    }
    
    return () => {
      // Скрываем кнопку при размонтировании компонента
      webApp?.MainButton?.hide();
    };
  }, [webApp, isLoading, navigate]);

  const toggleStory = (id: number) => {
    setExpandedStory(expandedStory === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка историй успеха...</p>
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
          Истории успеха
        </h1>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 animate-slide-in-right" style={{ animationDelay: '50ms' }}>
          Вдохновляющие истории наших учеников, которые добились успеха на Wildberries
        </p>
        
        <div className="space-y-4">
          {successStories.map((story, index) => (
            <div key={story.id} style={{ animationDelay: `${100 + index * 100}ms` }}>
              <Card 
                variant={expandedStory === story.id ? 'primary' : 'default'}
                className="animate-slide-in-right transition-all duration-300" 
                onClick={() => toggleStory(story.id)}
              >
                <div className="flex items-start">
                  <div className="text-3xl mr-4">{story.avatar}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{story.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{story.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-bold">{story.revenue}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">за {story.period}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="italic text-sm">{story.quote}</p>
                      
                      {expandedStory === story.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                          {story.fullStory.split('\n\n').map((paragraph, i) => (
                            <p key={i} className="mb-3 text-sm">{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStory(story.id);
                        }}
                      >
                        {expandedStory === story.id ? 'Свернуть' : 'Подробнее'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
        
        <div style={{ animationDelay: '600ms' }}>
          <Card 
            variant="accent" 
            className="mt-6 animate-slide-in-right" 
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">Начните свою историю успеха</h3>
              <p className="mb-4 text-sm">
                Присоединяйтесь к нашему курсу и станьте следующим успешным продавцом на Wildberries
              </p>
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => navigate('/subscription')}
              >
                Получить доступ к курсу
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuccessStoriesPage; 