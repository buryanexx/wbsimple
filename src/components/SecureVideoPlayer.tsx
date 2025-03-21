import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../config';
import ReactPlayer from 'react-player';
import { videosAPI } from '../services/api';

interface SecureVideoPlayerProps {
  videoId: string;
  lessonId: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
}

const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoId,
  lessonId,
  onProgress,
  onComplete,
  className = '',
}) => {
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const progressInterval = useRef<number | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Получение защищенного URL для видео
  useEffect(() => {
    const fetchSecureUrl = async () => {
      try {
        if (!user) {
          setError('Необходима авторизация для просмотра видео');
          setLoading(false);
          return;
        }

        const response = await videosAPI.getSecureVideoUrl(videoId);
        // Используем полный URL для видео
        setVideoUrl(`${API_URL}${response.data.secureUrl}`);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при получении URL видео:', err);
        setError('Не удалось загрузить видео. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchSecureUrl();
    
    // Периодически обновляем URL для предотвращения истечения срока токена
    const refreshInterval = setInterval(fetchSecureUrl, 10 * 60 * 1000); // Обновляем каждые 10 минут
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [videoId, user]);

  // Получение прогресса просмотра видео
  useEffect(() => {
    const fetchVideoProgress = async () => {
      try {
        if (!user) return;

        const response = await videosAPI.getVideoProgress(videoId);
        setCurrentProgress(response.data.progress || 0);
        
        // Если используем ReactPlayer, устанавливаем время через ref
        if (playerRef.current && response.data.progress > 0) {
          const duration = playerRef.current.getDuration();
          if (duration && !isNaN(duration)) {
            const seekTime = (response.data.progress / 100) * duration;
            playerRef.current.seekTo(seekTime, 'seconds');
          }
        }
      } catch (err) {
        console.error('Ошибка при получении прогресса видео:', err);
      }
    };

    if (videoUrl) {
      fetchVideoProgress();
    }
  }, [videoId, user, videoUrl]);

  // Настройка интервала для отправки прогресса
  useEffect(() => {
    // Очищаем предыдущий интервал при обновлении videoId
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    if (!user || !videoUrl) return;
    
    // Создаем новый интервал
    const intervalId = window.setInterval(() => {
      // Если используем ReactPlayer, получаем прогресс из него
      if (playerRef.current) {
        const duration = playerRef.current.getDuration();
        const currentTime = playerRef.current.getCurrentTime();
        
        if (duration && !isNaN(duration) && currentTime && !isNaN(currentTime)) {
          const progress = Math.floor((currentTime / duration) * 100);
          setCurrentProgress(progress);
          
          // Отправляем прогресс на сервер
          videosAPI.markVideoAsWatched(videoId, progress, lessonId)
            .catch(err => {
              console.error('Ошибка при отправке прогресса:', err);
            });
          
          // Если прогресс больше 90%, считаем видео просмотренным
          if (progress >= 90 && onComplete) {
            onComplete();
          }
          
          // Вызываем колбэк onProgress если он предоставлен
          if (onProgress) {
            onProgress(progress);
          }
        }
      }
    }, 10000); // Каждые 10 секунд
    
    progressInterval.current = intervalId;
    
    return () => {
      clearInterval(intervalId);
      
      // Отправляем финальный прогресс при размонтировании
      if (user && currentProgress > 0) {
        videosAPI.markVideoAsWatched(videoId, currentProgress, lessonId)
          .catch(err => {
            console.error('Ошибка при отправке финального прогресса:', err);
          });
      }
    };
  }, [videoId, user, videoUrl, lessonId, onProgress, onComplete, currentProgress]);

  // Обработчики событий для ReactPlayer
  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    const progress = Math.floor(state.played * 100);
    setCurrentProgress(progress);
    
    if (onProgress) {
      onProgress(progress);
    }
  };
  
  const handleEnded = () => {
    if (onComplete) {
      onComplete();
    }
  };
  
  const handleError = (error: any) => {
    console.error('Ошибка воспроизведения видео:', error);
    setError('Произошла ошибка при воспроизведении видео. Пожалуйста, попробуйте позже.');
  };

  // Предотвращаем контекстное меню для усложнения скачивания
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-100 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center text-red-500 p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} onContextMenu={handleContextMenu}>
      <ReactPlayer
        ref={playerRef}
        url={videoUrl || undefined}
        className="w-full rounded-lg"
        width="100%"
        height="auto"
        controls
        playsinline
        playing={false}
        onProgress={handleProgress}
        onEnded={handleEnded}
        onError={handleError}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              disablePictureInPicture: true,
              onContextMenu: () => false
            }
          }
        }}
      />
      {currentProgress > 0 && currentProgress < 100 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div
            className="h-full bg-primary"
            style={{ width: `${currentProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default SecureVideoPlayer; 