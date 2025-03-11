import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import ReactPlayer from 'react-player/lazy';
import Card from '../components/Card';
import Button from '../components/Button';

// Временные данные для уроков
const lessonsData = {
  1: [
    {
      id: 1,
      title: 'Введение в Wildberries',
      description: 'Обзор маркетплейса Wildberries и его преимущества',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Демо-видео
      duration: '10:25',
      materials: [
        { name: 'Презентация "Введение в Wildberries"', url: '#' },
        { name: 'Чек-лист для начинающих', url: '#' }
      ],
      quiz: [
        {
          question: 'Какой год основания Wildberries?',
          options: ['2000', '2004', '2010', '2015'],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 2,
      title: 'Регистрация личного кабинета',
      description: 'Пошаговая инструкция по регистрации на Wildberries',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Демо-видео
      duration: '15:30',
      materials: [
        { name: 'Инструкция по регистрации', url: '#' }
      ],
      quiz: [
        {
          question: 'Какой документ необходим для регистрации на Wildberries?',
          options: ['Паспорт', 'ИНН', 'СНИЛС', 'Все вышеперечисленное'],
          correctAnswer: 3
        }
      ]
    }
  ],
  2: [
    {
      id: 1,
      title: 'Анализ рынка Wildberries',
      description: 'Как анализировать рынок и находить прибыльные ниши',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Демо-видео
      duration: '20:15',
      materials: [
        { name: 'Таблица для анализа ниши', url: '#' },
        { name: 'Список популярных категорий', url: '#' }
      ],
      quiz: [
        {
          question: 'Какой показатель важнее всего при выборе ниши?',
          options: ['Количество продаж', 'Цена товара', 'Маржинальность', 'Конкуренция'],
          correctAnswer: 2
        }
      ]
    }
  ]
};

const LessonPage = () => {
  const { moduleId = '1', lessonId = '1' } = useParams();
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [activeTab, setActiveTab] = useState<'video' | 'materials' | 'quiz'>('video');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  // Получаем данные урока
  const moduleIdNum = parseInt(moduleId);
  const lessonIdNum = parseInt(lessonId);
  const module = lessonsData[moduleIdNum as keyof typeof lessonsData] || [];
  const lesson = module.find(l => l.id === lessonIdNum);

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
    setQuizAnswers([]);
    setShowResults(false);
    setVideoReady(false);
    
    // Настраиваем кнопку Telegram
    if (webApp?.MainButton) {
      if (activeTab === 'quiz') {
        webApp.MainButton.setText('Проверить ответы');
        webApp.MainButton.show();
        webApp.MainButton.onClick(() => {
          setShowResults(true);
        });
      } else {
        webApp.MainButton.hide();
      }
    }
    
    return () => {
      webApp?.MainButton?.hide();
    };
  }, [webApp, moduleId, lessonId, activeTab]);

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

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const isAnswerCorrect = (questionIndex: number) => {
    if (!showResults) return null;
    const question = lesson.quiz[questionIndex];
    return quizAnswers[questionIndex] === question.correctAnswer;
  };

  const nextLesson = module.find(l => l.id === lessonIdNum + 1);
  const prevLesson = module.find(l => l.id === lessonIdNum - 1);

  return (
    <div className="p-4 pb-36 animate-fade-in">
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
        <button
          className={`py-2 px-4 font-medium transition-colors duration-200 ${
            activeTab === 'quiz' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('quiz')}
        >
          Тест
        </button>
      </div>
      
      {/* Содержимое вкладок */}
      <div className="mb-16"> {/* Отступ снизу для навигации */}
        {activeTab === 'video' && (
          <div className="animate-fade-in">
            <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative">
              {!videoReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className={`w-full h-0 pb-[56.25%] relative ${videoReady ? 'opacity-100' : 'opacity-0'}`}>
                <ReactPlayer
                  url={lesson.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  style={{ position: 'absolute', top: 0, left: 0 }}
                  onReady={() => setVideoReady(true)}
                />
              </div>
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
                        <span className="text-primary mr-2">📄</span>
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
        
        {activeTab === 'quiz' && (
          <div className="animate-fade-in">
            <Card className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Проверьте свои знания</h2>
              {lesson.quiz.map((question, qIndex) => (
                <div key={qIndex} className="mb-6 last:mb-0 animate-slide-in-right" style={{ animationDelay: `${qIndex * 100}ms` }}>
                  <h3 className="font-medium mb-3">{qIndex + 1}. {question.question}</h3>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div 
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          quizAnswers[qIndex] === oIndex 
                            ? showResults
                              ? isAnswerCorrect(qIndex)
                                ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                                : 'bg-red-100 dark:bg-red-900/30 border-red-500'
                              : 'bg-primary/10 border-primary'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            quizAnswers[qIndex] === oIndex 
                              ? showResults
                                ? isAnswerCorrect(qIndex)
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : 'border-red-500 bg-red-500 text-white'
                                : 'border-primary bg-primary text-white'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {quizAnswers[qIndex] === oIndex && (
                              <span className="text-xs">✓</span>
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {showResults && (
                    <div className={`mt-2 text-sm ${isAnswerCorrect(qIndex) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isAnswerCorrect(qIndex) 
                        ? '✅ Правильно!' 
                        : `❌ Неправильно. Правильный ответ: ${question.options[question.correctAnswer]}`
                      }
                    </div>
                  )}
                </div>
              ))}
              {!showResults && (
                <Button 
                  variant="primary" 
                  className="mt-4"
                  onClick={() => setShowResults(true)}
                  disabled={quizAnswers.length !== lesson.quiz.length}
                >
                  Проверить ответы
                </Button>
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