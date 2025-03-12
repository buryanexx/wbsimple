import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import axios from 'axios';

// Базовый URL API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SecureVideoPlayerProps {
  videoId: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
  onEnded?: () => void;
}

const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoId,
  onReady,
  onError,
  onProgress,
  onEnded
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);
  const webApp = useWebApp();
  const urlExpiryTimeRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Функция для получения защищенного URL видео
  const getSecureVideoUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const initData = localStorage.getItem('telegram_init_data') || webApp?.initData;
      
      if (!token || !initData) {
        throw new Error('Не авторизован');
      }

      const response = await axios.get(`${API_URL}/videos/${videoId}/secure-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Telegram-Init-Data': initData
        }
      });

      const { url, expiresIn } = response.data;
      
      // Сохраняем время истечения URL
      urlExpiryTimeRef.current = Date.now() + (expiresIn * 1000);
      
      // Устанавливаем таймер для обновления URL за 30 секунд до истечения срока
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      
      refreshTimerRef.current = setTimeout(() => {
        getSecureVideoUrl();
      }, (expiresIn - 30) * 1000);

      setVideoUrl(url);
      return url;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при получении URL видео';
      setError(errorMessage);
      if (onError) {
        onError(new Error(errorMessage));
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSecureVideoUrl();
    
    // Очистка при размонтировании
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [videoId]);

  // Обработчик события контекстного меню (правый клик)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Обработчик события копирования
  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-gray-200 dark:bg-gray-800 rounded-lg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] bg-gray-200 dark:bg-gray-800 rounded-lg p-4">
        <div className="text-red-500 text-xl mb-2">⚠️</div>
        <p className="text-center text-gray-700 dark:text-gray-300">
          {error || 'Не удалось загрузить видео'}
        </p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          onClick={() => getSecureVideoUrl()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div 
      className="video-container relative w-full h-0 pb-[56.25%] bg-black rounded-lg overflow-hidden select-none"
      onContextMenu={handleContextMenu}
      onCopy={handleCopy}
    >
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
        controls
        playing
        onReady={onReady}
        onError={(e) => {
          setError('Ошибка воспроизведения видео');
          if (onError) {
            onError(new Error('Ошибка воспроизведения видео'));
          }
        }}
        onProgress={onProgress}
        onEnded={onEnded}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload noremoteplayback',
              disablePictureInPicture: true,
              disableRemotePlayback: true
            },
            forceVideo: true
          }
        }}
      />
      
      {/* Водяной знак с ID пользователя */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute bottom-4 right-4 text-white text-opacity-50 text-sm">
          {webApp?.initDataUnsafe?.user?.id || 'WB Simple'}
        </div>
      </div>
    </div>
  );
};

export default SecureVideoPlayer; 