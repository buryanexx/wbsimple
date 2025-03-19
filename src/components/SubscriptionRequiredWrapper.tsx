import React, { ReactNode } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface SubscriptionRequiredWrapperProps {
  children: ReactNode;
  contentType: 'modules' | 'lessons' | 'templates' | 'premium';
  fallbackMessage?: string;
}

const SubscriptionRequiredWrapper: React.FC<SubscriptionRequiredWrapperProps> = ({
  children,
  contentType,
  fallbackMessage
}) => {
  const { hasAccess, subscription } = useSubscription();
  const navigate = useNavigate();

  const hasContentAccess = hasAccess(contentType);

  if (hasContentAccess) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center text-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-5a1 1 0 11-2 0V7a1 1 0 112 0v4zm0 3a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          Доступ ограничен
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {fallbackMessage || `Для доступа к этому ${
            contentType === 'modules' ? 'модулю' : 
            contentType === 'lessons' ? 'уроку' : 
            contentType === 'templates' ? 'шаблону' : 
            'контенту'
          } требуется активная подписка.`}
        </p>
        
        {!subscription.isActive && (
          <button
            onClick={() => navigate('/subscription')}
            className="w-full py-2 px-4 bg-primary text-white rounded-md font-medium"
          >
            Оформить подписку
          </button>
        )}
        
        <button 
          onClick={() => navigate('/')}
          className="w-full mt-3 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

export default SubscriptionRequiredWrapper; 