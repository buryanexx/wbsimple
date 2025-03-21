import React, { useEffect, useRef } from 'react';

// Объявление глобальной переменной для Telegram Web App
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

interface TelegramAuthProps {
  onAuth: (data: any) => void;
  botName: string;
}

/**
 * Компонент для авторизации через Telegram
 */
const TelegramAuth: React.FC<TelegramAuthProps> = ({ onAuth, botName }) => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Проверяем, уже ли загружен скрипт Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      handleTelegramAuth();
      return;
    }

    if (!scriptLoaded.current) {
      scriptLoaded.current = true;
      
      // Загружаем скрипт Telegram
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      script.onload = handleTelegramAuth;
      
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const handleTelegramAuth = () => {
    if (window.Telegram && window.Telegram.WebApp) {
      // Сообщаем Telegram, что приложение готово
      window.Telegram.WebApp.ready();
      
      // Разворачиваем окно на всю высоту
      window.Telegram.WebApp.expand();
      
      // Получаем данные пользователя
      const initData = window.Telegram.WebApp.initData;
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
      
      if (initData && initDataUnsafe && initDataUnsafe.user) {
        // Передаем данные в родительский компонент
        onAuth({
          id: initDataUnsafe.user.id,
          first_name: initDataUnsafe.user.first_name,
          last_name: initDataUnsafe.user.last_name,
          username: initDataUnsafe.user.username,
          photo_url: initDataUnsafe.user.photo_url,
          auth_date: initDataUnsafe.auth_date,
          hash: initDataUnsafe.hash,
        });
      } else {
        console.warn('Telegram WebApp инициализирован, но данные пользователя отсутствуют');
      }
    }
  };

  return (
    <div className="telegram-auth">
      <h2>Авторизация через Telegram</h2>
      <p>Пожалуйста, войдите через Telegram Mini App или используйте кнопку ниже:</p>
      
      <div id="telegram-login">
        {/* Кнопка для открытия в Telegram */}
        <a 
          href={`https://t.me/${botName}/start`} 
          className="telegram-button"
          target="_blank" 
          rel="noopener noreferrer"
        >
          Открыть в Telegram
        </a>
      </div>
      
      <div className="auth-info">
        <p>
          Если вы уже в Telegram Mini App, данные для авторизации будут загружены автоматически.
        </p>
      </div>
    </div>
  );
};

export default TelegramAuth; 