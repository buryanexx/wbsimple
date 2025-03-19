import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const UserStatus: React.FC = () => {
  const { user } = useAuth();
  const { subscription, getFormattedEndDate, getDaysRemaining } = useSubscription();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Вы не авторизованы. Некоторые функции могут быть недоступны.
        </p>
        <button 
          className="mt-2 px-4 py-2 bg-primary text-white rounded-md text-sm"
          onClick={() => navigate('/profile')}
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-3">
        {user.photoUrl ? (
          <img 
            src={user.photoUrl} 
            alt={user.firstName}
            className="w-10 h-10 rounded-full mr-3" 
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
            {user.firstName.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.username ? `@${user.username}` : 'Telegram ID: ' + user.telegramId}
          </p>
        </div>
      </div>
      
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className={`flex items-center p-2 rounded-md ${subscription.isActive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${subscription.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {subscription.isActive ? `План ${subscription.plan}` : 'Подписка неактивна'}
            </p>
            {subscription.isActive && subscription.endDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                до {getFormattedEndDate()} ({getDaysRemaining()} дн.)
              </p>
            )}
          </div>
          <button 
            className="text-xs px-3 py-1 bg-primary text-white rounded-md"
            onClick={() => navigate('/subscription')}
          >
            {subscription.isActive ? 'Продлить' : 'Оформить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserStatus; 