import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';

// Типы для данных профиля
interface UserProfile {
  name: string;
  photo?: string;
  subscriptionStatus: 'active' | 'inactive';
  subscriptionExpiry?: string;
  progress: {
    completedLessons: number;
    totalLessons: number;
    completedModules: number;
    totalModules: number;
  };
  achievements: {
    id: number;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }[];
  statistics: {
    daysActive: number;
    testsCompleted: number;
    averageScore: number;
  };
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'achievements'>('progress');

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      // В реальном приложении здесь будет запрос к API
      // Для демонстрации используем моковые данные
      const mockProfile: UserProfile = {
        name: webApp?.initDataUnsafe?.user?.first_name || 'Пользователь',
        photo: webApp?.initDataUnsafe?.user?.photo_url,
        subscriptionStatus: 'inactive',
        progress: {
          completedLessons: 5,
          totalLessons: 42,
          completedModules: 1,
          totalModules: 8
        },
        achievements: [
          {
            id: 1,
            title: 'Первые шаги',
            description: 'Завершите первый урок',
            icon: '🏆',
            unlocked: true
          },
          {
            id: 2,
            title: 'Исследователь',
            description: 'Изучите все материалы первого модуля',
            icon: '🔍',
            unlocked: true
          },
          {
            id: 3,
            title: 'Знаток Wildberries',
            description: 'Пройдите все тесты с первой попытки',
            icon: '🧠',
            unlocked: false
          },
          {
            id: 4,
            title: 'Мастер продаж',
            description: 'Достигните 100 000 рублей продаж',
            icon: '💰',
            unlocked: false
          },
          {
            id: 5,
            title: 'Эксперт Wildberries',
            description: 'Завершите все модули курса',
            icon: '🎓',
            unlocked: false
          }
        ],
        statistics: {
          daysActive: 7,
          testsCompleted: 3,
          averageScore: 85
        }
      };
      
      setProfile(mockProfile);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [webApp]);

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка профиля...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg mb-4">Не удалось загрузить профиль</p>
        <Button 
          variant="primary"
          onClick={() => navigate('/')}
        >
          Вернуться на главную
        </Button>
      </div>
    );
  }

  const progressPercentage = Math.round(
    (profile.progress.completedLessons / profile.progress.totalLessons) * 100
  );

  const moduleProgressPercentage = Math.round(
    (profile.progress.completedModules / profile.progress.totalModules) * 100
  );

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
        <h1 className="text-xl font-bold">Профиль</h1>
        <div className="w-10"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      {/* Информация о пользователе */}
      <Card className="mb-6 animate-slide-in-right">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-4 border-2 border-primary">
            {profile.photo ? (
              <img 
                src={profile.photo} 
                alt={profile.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                👤
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{profile.name}</h2>
            <div className={`text-sm flex items-center ${
              profile.subscriptionStatus === 'active' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {profile.subscriptionStatus === 'active' ? (
                <>
                  <span className="mr-1">✓</span>
                  <span>Подписка активна до {profile.subscriptionExpiry}</span>
                </>
              ) : (
                <>
                  <span className="mr-1">○</span>
                  <span>Подписка не активна</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Вкладки */}
      <div className="flex mb-4">
        <button
          className={`flex-1 py-3 px-4 font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'progress' 
              ? 'text-primary border-primary' 
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('progress')}
        >
          Прогресс
        </button>
        <button
          className={`flex-1 py-3 px-4 font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'achievements' 
              ? 'text-primary border-primary' 
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('achievements')}
        >
          Достижения
        </button>
      </div>
      
      {activeTab === 'progress' && (
        <div className="animate-fade-in">
          {/* Прогресс обучения */}
          <Card className="mb-6">
            <h3 className="text-xl font-bold mb-4">Прогресс обучения</h3>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Общий прогресс</span>
                <span className="font-semibold">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-1000" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Прогресс по модулям</span>
                <span className="font-semibold">{moduleProgressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-orange-400 h-3 rounded-full transition-all duration-1000" 
                  style={{ width: `${moduleProgressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-1">
                  {profile.progress.completedLessons}
                  <span className="text-gray-400 text-lg">/{profile.progress.totalLessons}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">Уроков пройдено</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-4xl font-bold text-orange-400 mb-1">
                  {profile.progress.completedModules}
                  <span className="text-gray-400 text-lg">/{profile.progress.totalModules}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">Модулей завершено</div>
              </div>
            </div>
          </Card>
          
          {/* Статистика */}
          <Card className="mb-6">
            <h3 className="text-xl font-bold mb-4">Статистика</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-1">{profile.statistics.daysActive}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Дней<br />активности</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-1">{profile.statistics.testsCompleted}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Тестов<br />пройдено</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-1">{profile.statistics.averageScore}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Средний<br />балл</div>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {activeTab === 'achievements' && (
        <div className="animate-fade-in">
          {/* Достижения */}
          <div className="space-y-4">
            {profile.achievements.map((achievement) => (
              <Card 
                key={achievement.id}
                variant={achievement.unlocked ? 'primary' : 'default'}
                className={`transition-all duration-200 animate-slide-in-right ${
                  !achievement.unlocked && 'opacity-70'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 ${
                    achievement.unlocked 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold">{achievement.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="ml-auto text-primary text-2xl">✓</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Кнопка подписки */}
      {profile.subscriptionStatus === 'inactive' && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="accent" 
            size="lg"
            fullWidth
            onClick={handleSubscribe}
          >
            Оформить подписку
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 