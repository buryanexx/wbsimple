import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

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
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // В реальном приложении здесь будет запрос к API
    // Для демонстрации используем моковые данные
    const mockProfile: UserProfile = {
      name: webApp?.initDataUnsafe?.user?.first_name || 'Пользователь',
      photo: webApp?.initDataUnsafe?.user?.photo_url,
      subscriptionStatus: 'inactive',
      progress: {
        completedLessons: 0,
        totalLessons: 42,
        completedModules: 0,
        totalModules: 8
      },
      achievements: [
        {
          id: 1,
          title: 'Первые шаги',
          description: 'Завершите первый урок',
          icon: '🏆',
          unlocked: false
        },
        {
          id: 2,
          title: 'Исследователь',
          description: 'Изучите все материалы первого модуля',
          icon: '🔍',
          unlocked: false
        },
        {
          id: 3,
          title: 'Знаток Wildberries',
          description: 'Пройдите все тесты с первой попытки',
          icon: '🧠',
          unlocked: false
        }
      ]
    };
    
    setProfile(mockProfile);
  }, [webApp]);

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  if (!profile) {
    return <div className="p-4">Загрузка...</div>;
  }

  const progressPercentage = Math.round(
    (profile.progress.completedLessons / profile.progress.totalLessons) * 100
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-primary"
        >
          ← Назад
        </button>
        <h1 className="text-xl font-bold">Профиль</h1>
        <div className="w-6"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      {/* Информация о пользователе */}
      <div className="tg-card flex items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-4">
          {profile.photo ? (
            <img 
              src={profile.photo} 
              alt={profile.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              👤
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{profile.name}</h2>
          <div className={`text-sm ${
            profile.subscriptionStatus === 'active' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {profile.subscriptionStatus === 'active' 
              ? `Подписка активна до ${profile.subscriptionExpiry}` 
              : 'Подписка не активна'
            }
          </div>
        </div>
      </div>
      
      {/* Прогресс обучения */}
      <div className="tg-card mb-6">
        <h3 className="text-lg font-semibold mb-3">Прогресс обучения</h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Общий прогресс</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {profile.progress.completedLessons}
              <span className="text-gray-400 text-sm">/{profile.progress.totalLessons}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Уроков пройдено</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {profile.progress.completedModules}
              <span className="text-gray-400 text-sm">/{profile.progress.totalModules}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Модулей завершено</div>
          </div>
        </div>
      </div>
      
      {/* Достижения */}
      <div className="tg-card mb-6">
        <h3 className="text-lg font-semibold mb-3">Достижения</h3>
        <div className="space-y-3">
          {profile.achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`flex items-center p-3 rounded-lg border ${
                achievement.unlocked 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="text-2xl mr-3">{achievement.icon}</div>
              <div>
                <div className="font-medium">{achievement.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </div>
              </div>
              {achievement.unlocked && (
                <div className="ml-auto text-primary">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Кнопка подписки */}
      {profile.subscriptionStatus === 'inactive' && (
        <button 
          onClick={handleSubscribe} 
          className="tg-button-accent w-full"
        >
          Оформить подписку
        </button>
      )}
    </div>
  );
};

export default ProfilePage; 