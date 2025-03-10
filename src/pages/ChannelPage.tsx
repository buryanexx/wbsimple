import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

const ChannelPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // В реальном приложении здесь будет проверка статуса подписки
    // Для демонстрации используем моковые данные
    const checkSubscription = () => {
      // Имитация задержки запроса к API
      setTimeout(() => {
        setHasSubscription(false); // Для демонстрации устанавливаем false
        setIsLoading(false);
      }, 1000);
    };
    
    checkSubscription();
  }, []);

  const handleJoinChannel = () => {
    if (hasSubscription) {
      // В реальном приложении здесь будет генерация инвайт-ссылки
      // Для демонстрации просто открываем ссылку на Telegram
      if (webApp) {
        webApp.openTelegramLink('https://t.me/+exampleinvitelink');
      }
    } else {
      // Показываем уведомление о необходимости подписки
      if (webApp) {
        webApp.showPopup({
          title: 'Требуется подписка',
          message: 'Для доступа в закрытый канал необходимо оформить подписку.',
          buttons: [
            { id: 'subscribe', type: 'default', text: 'Оформить подписку' },
            { id: 'cancel', type: 'cancel', text: 'Отмена' }
          ]
        }, (buttonId: string) => {
          if (buttonId === 'subscribe') {
            navigate('/subscription');
          }
        });
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-primary"
        >
          ← Назад
        </button>
        <h1 className="text-xl font-bold">Закрытый канал</h1>
        <div className="w-6"></div> {/* Для выравнивания заголовка по центру */}
      </div>
      
      <div className="tg-card mb-6 text-center py-8">
        <div className="text-5xl mb-4">👥</div>
        <h2 className="text-xl font-semibold mb-2">Закрытое сообщество WB Simple</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Присоединяйтесь к закрытому сообществу продавцов Wildberries, где вы сможете общаться с единомышленниками и получать эксклюзивные материалы.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <button 
            onClick={handleJoinChannel} 
            className={`px-6 py-3 rounded-lg font-medium ${
              hasSubscription 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {hasSubscription ? 'Присоединиться к каналу' : 'Требуется подписка'}
          </button>
        )}
      </div>
      
      <div className="tg-card">
        <h3 className="text-lg font-semibold mb-3">Преимущества закрытого канала:</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Эксклюзивные материалы и обновления</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Общение с опытными продавцами Wildberries</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Ранний доступ к новым модулям и шаблонам</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Возможность задать вопросы и получить поддержку</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Обсуждение актуальных трендов и стратегий</span>
          </li>
        </ul>
      </div>
      
      {!hasSubscription && (
        <div className="mt-6">
          <button 
            onClick={() => navigate('/subscription')} 
            className="tg-button-accent w-full"
          >
            Оформить подписку
          </button>
        </div>
      )}
    </div>
  );
};

export default ChannelPage; 