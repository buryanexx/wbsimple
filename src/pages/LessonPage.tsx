import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';
import SecureVideoPlayer from '../components/SecureVideoPlayer';
import { modulesData } from '../data/modules';
import { useAuthContext } from '../contexts/AuthContext';

// Временные данные для уроков
const lessonsData = {
  1: [
    {
      id: 1,
      title: 'Введение в Wildberries',
      description: 'Обзор маркетплейса Wildberries и его преимущества',
      videoId: 'video-1-1', // ID видео для получения защищенного URL
      duration: '10:25',
      materials: [
        { name: 'Презентация "Введение в Wildberries"', url: '#', type: 'presentation' },
        { name: 'Чек-лист для начинающих', url: '#', type: 'checklist' }
      ]
    },
    {
      id: 2,
      title: 'Регистрация личного кабинета',
      description: 'Пошаговая инструкция по регистрации на Wildberries',
      videoId: 'video-1-2', // ID видео для получения защищенного URL
      duration: '15:30',
      materials: [
        { name: 'Инструкция по регистрации', url: '#', type: 'guide' },
        { name: 'Чек-лист регистрации', url: '#', type: 'checklist' }
      ]
    }
  ],
  2: [
    {
      id: 1,
      title: 'Анализ рынка Wildberries',
      description: 'Как анализировать рынок и находить прибыльные ниши',
      videoId: 'video-2-1', // ID видео для получения защищенного URL
      duration: '20:15',
      materials: [
        { name: 'Таблица для анализа ниши', url: '#', type: 'spreadsheet' },
        { name: 'Список популярных категорий', url: '#', type: 'document' },
        { name: 'Чек-лист анализа конкурентов', url: '#', type: 'checklist' }
      ]
    }
  ]
};

const LessonPage = () => {
  const { moduleId = '1', lessonId = '1' } = useParams();
  const navigate = useNavigate();
  const webApp = useWebApp();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'video' | 'materials'>('video');
  const [isLoading, setIsLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Получаем данные урока
  const moduleIdNum = parseInt(moduleId);
  const lessonIdNum = parseInt(lessonId);
  const module = lessonsData[moduleIdNum as keyof typeof lessonsData] || [];
  const lesson = module.find(l => l.id === lessonIdNum);
  
  // Проверяем доступность модуля
  const currentModule = modulesData.find(m => m.id === moduleIdNum);
  const isModuleAvailable = currentModule?.isFree || (user && user.isSubscribed);

  useEffect(() => {
    // Если модуль недоступен, перенаправляем на страницу подписки
    if (!isLoading && !isModuleAvailable) {
      navigate('/subscription');
    }
  }, [isLoading, isModuleAvailable, navigate]);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Сбрасываем состояние при изменении урока
    setActiveTab('video');
    setVideoReady(false);
    setVideoError(null);
    
    // Настраиваем кнопку Telegram
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
    
    return () => {
      webApp?.MainButton?.hide();
    };
  }, [webApp, moduleId, lessonId]);

  // Обработчики событий видеоплеера
  const handleVideoReady = () => {
    setVideoReady(true);
  };

  const handleVideoError = (error: Error) => {
    setVideoError(error.message);
    setVideoReady(false);
  };

  const handleVideoProgress = (progress: { played: number; playedSeconds: number }) => {
    // Здесь можно добавить логику для отслеживания прогресса просмотра
    // Например, сохранять позицию для возможности продолжить просмотр позже
  };

  const handleVideoEnded = () => {
    // Здесь можно добавить логику для отметки урока как просмотренного
    // И предложить перейти к следующему уроку
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred('success');
    }
    
    if (nextLesson) {
      // Показываем кнопку для перехода к следующему уроку
      if (webApp?.MainButton) {
        webApp.MainButton.setText('Перейти к следующему уроку');
        webApp.MainButton.show();
        webApp.MainButton.onClick(() => {
          navigate(`/lesson/${moduleId}/${nextLesson.id}`);
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка урока...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg mb-4">Урок не найден</p>
        <Button 
          variant="primary"
          onClick={() => navigate('/modules')}
        >
          Вернуться к модулям
        </Button>
      </div>
    );
  }

  const nextLesson = module.find(l => l.id === lessonIdNum + 1);
  const prevLesson = module.find(l => l.id === lessonIdNum - 1);

  // Функция для получения иконки материала в зависимости от типа
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'presentation':
        return '📊';
      case 'checklist':
        return '✅';
      case 'guide':
        return '📋';
      case 'spreadsheet':
        return '📈';
      case 'document':
        return '📄';
      default:
        return '📄';
    }
  };

  return (
    <div className="p-4 pb-44 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
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
      
      {/* Навигация по вкладкам */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium transition-colors duration-200 ${
            activeTab === 'video' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('video')}
        >
          Видео
        </button>
        <button
          className={`py-2 px-4 font-medium transition-colors duration-200 ${
            activeTab === 'materials' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('materials')}
        >
          Материалы
        </button>
      </div>
      
      {/* Содержимое вкладок */}
      <div className="mb-16"> {/* Отступ снизу для навигации */}
        {activeTab === 'video' && (
          <div className="animate-fade-in">
            <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative">
              <SecureVideoPlayer
                videoId={lesson.videoId}
                onReady={handleVideoReady}
                onError={handleVideoError}
                onProgress={handleVideoProgress}
                onEnded={handleVideoEnded}
              />
            </div>
            <Card className="mb-4 animate-slide-in-right">
              <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {lesson.description}
              </p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">⏱️</span>
                <span>Продолжительность: {lesson.duration}</span>
              </div>
            </Card>
          </div>
        )}
        
        {activeTab === 'materials' && (
          <div className="animate-fade-in">
            <Card className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Дополнительные материалы</h2>
              {lesson.materials.length > 0 ? (
                <ul className="space-y-3">
                  {lesson.materials.map((material, index) => (
                    <li key={index} className="animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                      <Card 
                        variant="outline" 
                        className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        onClick={() => window.open(material.url, '_blank')}
                      >
                        <span className="text-primary mr-2">{getMaterialIcon(material.type)}</span>
                        <span>{material.name}</span>
                      </Card>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Для этого урока нет дополнительных материалов.
                </p>
              )}
            </Card>
          </div>
        )}
      </div>
      
      {/* Навигация между уроками */}
      <div className="fixed bottom-20 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => prevLesson ? navigate(`/lesson/${moduleId}/${prevLesson.id}`) : navigate('/modules')}
          leftIcon={<span className="text-lg">←</span>}
          disabled={!prevLesson}
        >
          {prevLesson ? 'Предыдущий' : 'К модулям'}
        </Button>
        
        <Button 
          variant="primary" 
          onClick={() => nextLesson ? navigate(`/lesson/${moduleId}/${nextLesson.id}`) : navigate('/modules')}
          rightIcon={<span className="text-lg">→</span>}
          disabled={!nextLesson}
        >
          {nextLesson ? 'Следующий' : 'Завершить'}
        </Button>
      </div>
    </div>
  );
};

export default LessonPage; 