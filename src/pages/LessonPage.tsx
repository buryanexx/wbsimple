import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import ReactPlayer from 'react-player/lazy';

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

  // Получаем данные урока
  const moduleIdNum = parseInt(moduleId);
  const lessonIdNum = parseInt(lessonId);
  const module = lessonsData[moduleIdNum as keyof typeof lessonsData] || [];
  const lesson = module.find(l => l.id === lessonIdNum);

  useEffect(() => {
    // Сбрасываем состояние при изменении урока
    setActiveTab('video');
    setQuizAnswers([]);
    setShowResults(false);
    
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

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p>Урок не найден</p>
        <button 
          onClick={() => navigate('/modules')} 
          className="tg-button mt-4"
        >
          Вернуться к модулям
        </button>
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/modules')} 
          className="flex items-center text-primary"
        >
          ← К модулям
        </button>
        <h1 className="text-lg font-bold truncate max-w-[200px]">{lesson.title}</h1>
        <div className="w-6"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      {/* Навигация по вкладкам */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'video' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('video')}
        >
          Видео
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'materials' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('materials')}
        >
          Материалы
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'quiz' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('quiz')}
        >
          Тест
        </button>
      </div>
      
      {/* Содержимое вкладок */}
      <div className="mb-16"> {/* Отступ снизу для навигации */}
        {activeTab === 'video' && (
          <div>
            <div className="aspect-w-16 aspect-h-9 mb-4 bg-black rounded-lg overflow-hidden">
              <div className="w-full h-0 pb-[56.25%] relative">
                <ReactPlayer
                  url={lesson.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {lesson.description}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Продолжительность: {lesson.duration}
            </div>
          </div>
        )}
        
        {activeTab === 'materials' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Дополнительные материалы</h2>
            {lesson.materials.length > 0 ? (
              <ul className="space-y-3">
                {lesson.materials.map((material, index) => (
                  <li key={index}>
                    <a 
                      href={material.url} 
                      className="tg-card flex items-center"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <span className="text-primary mr-2">📄</span>
                      <span>{material.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Для этого урока нет дополнительных материалов.
              </p>
            )}
          </div>
        )}
        
        {activeTab === 'quiz' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Проверьте свои знания</h2>
            {lesson.quiz.map((question, qIndex) => (
              <div key={qIndex} className="tg-card mb-4">
                <h3 className="font-medium mb-3">{question.question}</h3>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div 
                      key={oIndex}
                      onClick={() => handleAnswerSelect(qIndex, oIndex)}
                      className={`p-3 rounded-lg border cursor-pointer ${
                        quizAnswers[qIndex] === oIndex 
                          ? showResults
                            ? isAnswerCorrect(qIndex)
                              ? 'bg-green-100 dark:bg-green-900 border-green-500'
                              : 'bg-red-100 dark:bg-red-900 border-red-500'
                            : 'bg-primary/10 border-primary'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {option}
                      {showResults && quizAnswers[qIndex] === oIndex && (
                        <span className="float-right">
                          {isAnswerCorrect(qIndex) ? '✓' : '✗'}
                        </span>
                      )}
                      {showResults && oIndex === question.correctAnswer && !isAnswerCorrect(qIndex) && (
                        <span className="float-right text-green-500">✓</span>
                      )}
                    </div>
                  ))}
                </div>
                {showResults && (
                  <div className={`mt-3 p-2 rounded-lg ${
                    isAnswerCorrect(qIndex) 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {isAnswerCorrect(qIndex) 
                      ? 'Правильно! Отличная работа!' 
                      : `Неправильно. Правильный ответ: ${question.options[question.correctAnswer]}`
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Навигация по урокам */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
        <button 
          onClick={() => prevLesson && navigate(`/lesson/${moduleId}/${prevLesson.id}`)}
          className={`tg-button ${!prevLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!prevLesson}
        >
          ← Предыдущий
        </button>
        <button 
          onClick={() => nextLesson && navigate(`/lesson/${moduleId}/${nextLesson.id}`)}
          className={`tg-button-accent ${!nextLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!nextLesson}
        >
          Следующий →
        </button>
      </div>
    </div>
  );
};

export default LessonPage; 