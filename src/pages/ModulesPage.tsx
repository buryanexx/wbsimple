import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';
import UserStatus from '../components/UserStatus';
import { useSubscription } from '../hooks/useSubscription';
import { modulesData } from '../data/modules';
import { useAuth } from '../hooks/useAuth';

const ModulesPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const { hasAccess, subscription } = useSubscription();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [visibleModules, setVisibleModules] = useState<number[]>([]);
  const [userModules, setUserModules] = useState(modulesData);
  
  // API URLs
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.wbsimple.ru/api';

  useEffect(() => {
    // Загрузка данных пользователя и его прогресса
    const fetchUserProgress = async () => {
      try {
        setIsLoading(true);
        
        // В реальном проекте здесь будет запрос к API для получения прогресса пользователя
        // const response = await fetch(`${API_BASE_URL}/users/progress`, {
        //   method: 'GET',
        //   headers: {
        //     'Authorization': `Bearer ${user?.token}`,
        //     'Content-Type': 'application/json'
        //   }
        // });
        
        // if (response.ok) {
        //   const progressData = await response.json();
        //   // Обработка прогресса и обновление модулей
        // }
        
        // Обрабатываем данные о прогрессе из профиля пользователя
        if (user && user.progress) {
          const completedLessons = user.progress.completedLessons || [];
          const completedModules = user.progress.completedModules || [];
          
          // Обновляем данные о модулях с реальным прогрессом пользователя
          const updatedModules = modulesData.map(module => {
            // Считаем количество завершенных уроков в этом модуле
            const moduleLessonIds = module.lessons.map(lesson => lesson.id);
            const completedLessonsInModule = moduleLessonIds.filter(id => 
              completedLessons.includes(id)
            ).length;
            
            // Вычисляем процент прогресса
            const progress = module.lessonsCount > 0 
              ? Math.round((completedLessonsInModule / module.lessonsCount) * 100)
              : 0;
            
            // Обновляем прогресс модуля
            return {
              ...module,
              progress,
              isCompleted: completedModules.includes(module.id)
            };
          });
          
          setUserModules(updatedModules);
          console.log('Прогресс пользователя обновлен:', updatedModules);
        }
        
        // Имитация задержки загрузки для демонстрации UI
        setTimeout(() => {
          setIsLoading(false);
        }, 600);
      } catch (error) {
        console.error('Ошибка при загрузке прогресса пользователя:', error);
        setIsLoading(false);
      }
    };

    fetchUserProgress();
  }, [user]);

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

  const handleModuleClick = (moduleId: number) => {
    // Находим модуль по ID
    const module = modulesData.find(m => m.id === moduleId);
    
    if (module && (module.isFree || subscription.isActive)) {
      // Если модуль бесплатный или есть подписка, переходим к урокам модуля
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

  // Разделяем модули на бесплатные и премиум
  const freeModules = userModules.filter(module => module.isFree);
  const premiumModules = userModules.filter(module => !module.isFree);

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
      
      {/* Отображаем статус пользователя */}
      <div className="mb-6">
        <UserStatus />
      </div>
      
      {/* Бесплатные модули */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="bg-primary text-white text-xs py-1 px-2 rounded-full mr-2">Бесплатно</span>
          Доступные модули
        </h2>
        <div className="space-y-4">
          {freeModules.map((module, index) => (
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
                variant="default"
                className={`hover:shadow-md border-l-4 ${module.isCompleted ? 'border-green-500' : 'border-primary'}`}
                onClick={() => handleModuleClick(module.id)}
              >
                <div className="flex items-start">
                  <div className={`text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 ${module.color}`}>
                    <span className="text-xl">{module.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{module.title}</h2>
                      <span className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full flex items-center">
                        <span className="mr-1">✓</span>
                        Бесплатно
                      </span>
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
                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                          module.isCompleted ? 'bg-green-500' : module.color
                        }`}
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Премиум модули */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="bg-accent text-white text-xs py-1 px-2 rounded-full mr-2">Премиум</span>
          Модули по подписке
          {subscription.isActive && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 py-1 px-2 rounded-full">
              Доступно
            </span>
          )}
        </h2>
        <div className="space-y-4">
          {premiumModules.map((module, index) => (
            <div 
              key={module.id}
              className={`transform transition-all duration-300 ${
                visibleModules.includes(module.id) 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${(index + freeModules.length) * 100}ms` }}
            >
              <Card 
                variant={subscription.isActive ? "default" : "outline"}
                className={`hover:shadow-sm relative overflow-hidden ${
                  subscription.isActive 
                    ? `border-l-4 ${module.isCompleted ? 'border-green-500' : 'border-accent'}`
                    : ""
                }`}
                onClick={() => handleModuleClick(module.id)}
              >
                {/* Премиум оверлей */}
                <div className="absolute top-0 right-0 bg-accent text-white text-xs py-1 px-3 rounded-bl-lg">
                  Премиум
                </div>
                
                <div className="flex items-start">
                  <div className={`text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 ${module.color}`}>
                    <span className="text-xl">{module.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{module.title}</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {module.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{module.lessonsCount} уроков</span>
                      {!subscription.isActive && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/subscription');
                          }}
                        >
                          Открыть доступ
                        </Button>
                      )}
                      {subscription.isActive && (
                        <>
                          <span>{module.progress}% завершено</span>
                        </>
                      )}
                    </div>
                    {subscription.isActive && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-1000 ${
                            module.isCompleted ? 'bg-green-500' : module.color
                          }`}
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {!subscription.isActive && (
        <div className="mt-8 text-center">
          <Button 
            variant="accent" 
            size="lg"
            onClick={() => navigate('/subscription')}
          >
            Открыть все модули
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Подписка дает доступ ко всем 8 модулям курса и дополнительным материалам
          </p>
        </div>
      )}
    </div>
  );
};

export default ModulesPage; 