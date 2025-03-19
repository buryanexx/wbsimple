import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Button from '../components/Button';
import Card from '../components/Card';
import SubscriptionRequiredWrapper from '../components/SubscriptionRequiredWrapper';
import { useAuth } from '../hooks/useAuth';
import { modulesData } from '../data/modules';
import { lessonsData } from '../data/lessons';

// Интерфейс для параметров маршрута
interface LessonParams {
  moduleId: string;
  lessonId: string;
  [key: string]: string;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  isCompleted: boolean;
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
  isFree: boolean;
}

const LessonPage: React.FC = () => {
  const { moduleId = '1', lessonId = '1' } = useParams<LessonParams>();
  const navigate = useNavigate();
  const webApp = useWebApp();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<Module | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showModuleInfo, setShowModuleInfo] = useState(false);
  
  // Эффект для загрузки данных модуля и урока
  useEffect(() => {
    const timer = setTimeout(() => {
      const moduleData = modulesData.find(m => m.id === parseInt(moduleId)) || null;
      
      if (moduleData) {
        // Находим все уроки для текущего модуля
        const moduleWithLessons: Module = {
          ...moduleData,
          lessons: lessonsData
            .filter(lesson => lesson.moduleId === moduleData.id)
            .map(lesson => ({
              ...lesson,
              isCompleted: user?.progress?.completedLessons.includes(lesson.id) || false
            }))
        };
        
        setModule(moduleWithLessons);
        
        // Находим текущий урок
        const currentLesson = moduleWithLessons.lessons.find(
          l => l.id === parseInt(lessonId)
        ) || null;
        
        setLesson(currentLesson);
      }
      
      setLoading(false);
    }, 800);
    
    // Настраиваем кнопку назад, чтобы она вела к списку модулей
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => {
        navigate('/modules');
        return true;
      });
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [moduleId, lessonId, navigate, webApp, user]);
  
  // Обработчик для навигации между уроками
  const handleLessonChange = (direction: 'prev' | 'next') => {
    if (!module || !lesson) return;
    
    const currentIndex = module.lessons.findIndex(l => l.id === lesson.id);
    
    if (direction === 'prev' && currentIndex > 0) {
      // Переход к предыдущему уроку
      navigate(`/lesson/${moduleId}/${module.lessons[currentIndex - 1].id}`);
    } else if (direction === 'next' && currentIndex < module.lessons.length - 1) {
      // Переход к следующему уроку
      navigate(`/lesson/${moduleId}/${module.lessons[currentIndex + 1].id}`);
    } else if (direction === 'next' && currentIndex === module.lessons.length - 1) {
      // Завершение модуля
      webApp?.showPopup({
        title: "Модуль завершен!",
        message: "Поздравляем! Вы завершили этот модуль. Хотите вернуться к списку модулей?",
        buttons: [
          { id: "modules", type: "default", text: "К списку модулей" },
          { id: "stay", type: "cancel", text: "Остаться" }
        ]
      }, (buttonId) => {
        if (buttonId === "modules") {
          navigate('/modules');
        }
      });
    }
  };
  
  // Обработчик для отметки шагов урока как выполненных
  const handleCompleteStep = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(step => step !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка урока...</p>
      </div>
    );
  }
  
  if (!module || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Урок не найден</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Извините, запрошенный урок не существует.
        </p>
        <Button variant="primary" onClick={() => navigate('/modules')}>
          Вернуться к модулям
        </Button>
      </div>
    );
  }
  
  // Определяем, является ли это платный контент
  const requiresSubscription = !module.isFree;
  
  const content = (
    <div className="p-4 pb-40">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/modules')}
          leftIcon={<span className="text-lg">←</span>}
        >
          К модулям
        </Button>
        <Button 
          variant={showModuleInfo ? "primary" : "outline"} 
          onClick={() => setShowModuleInfo(!showModuleInfo)}
        >
          {showModuleInfo ? "Скрыть уроки" : "Все уроки"}
        </Button>
      </div>
      
      {showModuleInfo && (
        <Card variant="default" className="mb-6">
          <h2 className="text-xl font-bold mb-2">{module.title}</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto p-2">
            {module.lessons.map((moduleLesson, index) => (
              <div 
                key={moduleLesson.id}
                className={`p-3 rounded-lg transition-colors cursor-pointer ${
                  moduleLesson.id === lesson.id 
                    ? 'bg-primary/10 dark:bg-primary/20' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => navigate(`/lesson/${moduleId}/${moduleLesson.id}`)}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    moduleLesson.isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {moduleLesson.isCompleted ? '✓' : index + 1}
                  </div>
                  <p className={`${moduleLesson.id === lesson.id ? 'font-medium' : ''}`}>
                    {moduleLesson.title}
                  </p>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {moduleLesson.duration} мин
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
            {lesson.duration} мин
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Модуль {moduleId}</span>
          <span className="mx-2">•</span>
          <span>Урок {module.lessons.findIndex(l => l.id === lesson.id) + 1} из {module.lessons.length}</span>
        </div>
      </div>
      
      {lesson.videoUrl && (
        <div className="mb-6 relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src={lesson.videoUrl} 
            title={lesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      )}
      
      <div className="prose dark:prose-invert max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>
      
      <div className="mt-10 mb-6">
        <h3 className="text-lg font-semibold mb-4">Контрольные точки:</h3>
        <div className="space-y-3">
          {["Просмотр видеоурока", "Выполнение практического задания", "Закрепление материала"].map((step, index) => (
            <div 
              key={index}
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div
                className={`w-6 h-6 rounded-full mr-3 cursor-pointer ${
                  completedSteps.includes(index)
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                } flex items-center justify-center`}
                onClick={() => handleCompleteStep(index)}
              >
                {completedSteps.includes(index) ? '✓' : index + 1}
              </div>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => handleLessonChange('prev')}
          disabled={module.lessons.findIndex(l => l.id === lesson.id) === 0}
        >
          Предыдущий урок
        </Button>
        <Button 
          variant="primary" 
          onClick={() => handleLessonChange('next')}
        >
          {module.lessons.findIndex(l => l.id === lesson.id) === module.lessons.length - 1
            ? 'Завершить модуль'
            : 'Следующий урок'
          }
        </Button>
      </div>
    </div>
  );
  
  return requiresSubscription ? (
    <SubscriptionRequiredWrapper 
      contentType="lessons"
      fallbackMessage={`Этот урок из премиум-модуля "${module.title}" доступен только по подписке. Оформите подписку, чтобы получить доступ ко всем материалам.`}
    >
      {content}
    </SubscriptionRequiredWrapper>
  ) : (
    content
  );
};

export default LessonPage; 