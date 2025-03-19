import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import SecureVideoPlayer from '../components/SecureVideoPlayer';
import { modulesData } from '../data/modules';
import { useAuth } from '../hooks/useAuth.tsx';

const LessonPage = () => {
  const { moduleId = '0', lessonId = '0' } = useParams();
  const navigate = useNavigate();
  const webApp = useWebApp();
  const { user, loading, isAuthenticated, isPremium, markLessonCompleted, hasCompletedLesson } = useAuth();
  const [activeTab, setActiveTab] = useState<'video' | 'materials'>('video');
  const [isLoading, setIsLoading] = useState(true);
  const [videoCompleted, setVideoCompleted] = useState(false);
  
  // Получаем данные урока
  const moduleIdNum = parseInt(moduleId);
  const lessonIdNum = parseInt(lessonId);
  const module = modulesData.find(m => m.id === moduleIdNum);
  const lesson = module?.lessons.find(l => l.id === lessonIdNum);
  
  // Проверяем доступность модуля
  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Проверяем, доступен ли модуль
    const moduleData = modulesData.find(m => m.id === moduleIdNum);
    if (!moduleData) {
      navigate('/modules');
      return;
    }
    
    // Проверяем, доступен ли урок
    const lessonData = moduleData.lessons.find(l => l.id === lessonIdNum);
    if (!lessonData) {
      navigate(`/modules`);
      return;
    }
    
    // Проверяем, требуется ли премиум-подписка для доступа к модулю
    const isPremiumModule = !moduleData.isFree; // Проверяем свойство isFree модуля
    if (isPremiumModule && !isPremium) {
      navigate('/subscription');
      return;
    }
    
    return () => clearTimeout(timer);
  }, [moduleId, lessonId, navigate, isPremium]);
  
  useEffect(() => {
    // Сбрасываем состояние при изменении урока
    setActiveTab('video');
    
    // Проверяем, завершен ли урок
    if (lesson && hasCompletedLesson(lessonIdNum)) {
      setVideoCompleted(true);
    } else {
      setVideoCompleted(false);
    }
    
    // Настраиваем кнопку Telegram
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => {
        navigate('/modules');
      });
    }
    
    return () => {
      webApp?.BackButton?.hide();
      webApp?.MainButton?.hide();
    };
  }, [moduleId, lessonId, webApp, navigate, lesson, hasCompletedLesson, lessonIdNum]);
  
  // Обработчик завершения видео
  const handleVideoComplete = async () => {
    if (!videoCompleted && isAuthenticated) {
      setVideoCompleted(true);
      try {
        await markLessonCompleted(lessonIdNum);
      } catch (error) {
        console.error('Ошибка при отметке урока как завершенного:', error);
      }
    }
  };
  
  // Обработчик прогресса видео
  const handleVideoProgress = (progress: number) => {
    // Если прогресс больше 90%, считаем видео просмотренным
    if (progress >= 90 && !videoCompleted && isAuthenticated) {
      handleVideoComplete();
    }
  };
  
  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка урока...</p>
      </div>
    );
  }
  
  if (!lesson || !module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-xl font-bold mb-2">Урок не найден</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          Извините, запрошенный урок не существует или был удален.
        </p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/modules')}
        >
          Вернуться к модулям
        </Button>
      </div>
    );
  }
  
  const nextLesson = module.lessons.find(l => l.id === lessonIdNum + 1);
  const prevLesson = module.lessons.find(l => l.id === lessonIdNum - 1);
  
  // Функция для получения иконки материала в зависимости от типа
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <Icon name="file" className="text-red-500" />;
      case 'doc':
        return <Icon name="file" className="text-blue-500" />;
      case 'xls':
        return <Icon name="file" className="text-green-500" />;
      case 'link':
        return <Icon name="link" className="text-purple-500" />;
      default:
        return <Icon name="file" className="text-gray-500" />;
    }
  };
  
  return (
    <div className="pb-44">
      {/* Заголовок */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/modules')}
            leftIcon={<span className="text-lg">←</span>}
          >
            К модулям
          </Button>
          <h1 className="text-lg font-bold truncate max-w-[200px]">{lesson.title}</h1>
          <div className="w-10"></div> {/* Для выравнивания заголовка по центру */}
        </div>
        
        {/* Табы */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'video'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('video')}
          >
            Видео
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'materials'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('materials')}
          >
            Материалы
          </button>
        </div>
      </div>
      
      {/* Контент */}
      <div className="p-4">
        {activeTab === 'video' ? (
          <div>
            <div className="mb-6">
              <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                {isAuthenticated ? (
                  <SecureVideoPlayer
                    videoId={lesson.videoId}
                    lessonId={lessonIdNum.toString()}
                    onProgress={handleVideoProgress}
                    onComplete={handleVideoComplete}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-800">
                    <div className="text-center p-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Для просмотра видео необходимо авторизоваться
                      </p>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/')}
                      >
                        Войти
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Card className="mb-4 animate-slide-in-right">
                <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="mr-2">⏱️</span>
                    <span>Продолжительность: {lesson.duration}</span>
                  </div>
                  {videoCompleted && (
                    <div className="flex items-center text-sm text-green-500">
                      <span className="mr-2">✅</span>
                      <span>Просмотрено</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
            
            {/* Навигация между уроками */}
            <div className="flex justify-between">
              {prevLesson ? (
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/lesson/${moduleId}/${prevLesson.id}`)}
                  leftIcon={<span className="text-lg">←</span>}
                >
                  Предыдущий урок
                </Button>
              ) : (
                <div></div>
              )}
              
              {nextLesson ? (
                <Button 
                  variant="primary" 
                  onClick={() => navigate(`/lesson/${moduleId}/${nextLesson.id}`)}
                  rightIcon={<span className="text-lg">→</span>}
                >
                  Следующий урок
                </Button>
              ) : (
                <Button 
                  variant="accent" 
                  onClick={() => navigate('/modules')}
                >
                  Завершить модуль
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <Card className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Дополнительные материалы</h2>
              {lesson.materials && lesson.materials.length > 0 ? (
                <ul className="space-y-3">
                  {lesson.materials.map((material, index) => (
                    <li key={index} className="animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                      <Card 
                        variant="outline" 
                        className="hover:shadow-md transition-shadow duration-300"
                      >
                        <a 
                          href={material.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-2"
                        >
                          <div className="mr-3 text-primary">
                            {getMaterialIcon(material.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{material.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {material.description}
                            </p>
                          </div>
                          <div className="ml-2">
                            <Icon name="download" className="text-gray-400" />
                          </div>
                        </a>
                      </Card>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Для этого урока нет дополнительных материалов
                </p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage; 