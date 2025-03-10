import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      title: 'Добро пожаловать в WB Simple!',
      description: 'Образовательная платформа для обучения заработку на Wildberries с нуля до 1.000.000 рублей.',
      image: '🚀'
    },
    {
      title: 'Модульная структура обучения',
      description: '8 основных модулей, которые проведут вас от регистрации на Wildberries до масштабирования бизнеса.',
      image: '📚'
    },
    {
      title: 'Библиотека шаблонов',
      description: 'Готовые шаблоны карточек товаров, скрипты для поставщиков и другие полезные материалы.',
      image: '📋'
    },
    {
      title: 'Закрытое сообщество',
      description: 'Доступ к закрытому Telegram-каналу для подписчиков, где вы сможете общаться с единомышленниками.',
      image: '👥'
    }
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/');
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  // Настраиваем кнопку Telegram
  if (webApp?.MainButton) {
    webApp.MainButton.setText(currentStep < onboardingSteps.length - 1 ? 'Далее' : 'Начать');
    webApp.MainButton.show();
    webApp.MainButton.onClick(handleNext);
  }

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleSkip} 
            className="text-primary font-medium"
          >
            Пропустить
          </button>
        </div>
        
        <div className="flex justify-center mb-8 text-6xl">
          {currentStepData.image}
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4">
          {currentStepData.title}
        </h1>
        
        <p className="text-center text-gray-700 dark:text-gray-300 mb-8">
          {currentStepData.description}
        </p>
        
        <div className="flex justify-center space-x-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 rounded-full ${
                index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleNext} 
            className="tg-button w-full"
          >
            {currentStep < onboardingSteps.length - 1 ? 'Далее' : 'Начать'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage; 