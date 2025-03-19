import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { API_URL } from '../config';

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
  const videoRef = useRef<HTMLVideoElement>(null);
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

        const response = await fetch(`${API_URL}/api/videos/secure-url/${videoId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Не удалось получить доступ к видео');
        }

        const data = await response.json();
        setVideoUrl(data.secureUrl);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при получении URL видео:', err);
        setError('Не удалось загрузить видео. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchSecureUrl();
  }, [videoId, user]);

  // Получение прогресса просмотра видео
  useEffect(() => {
    const fetchVideoProgress = async () => {
      try {
        if (!user) return;

        const response = await fetch(`${API_URL}/api/videos/progress/${videoId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.progress && videoRef.current) {
            // Устанавливаем время видео на сохраненную позицию
            const duration = videoRef.current.duration;
            if (!isNaN(duration)) {
              videoRef.current.currentTime = (data.progress / 100) * duration;
              setCurrentProgress(data.progress);
            }
          }
        }
      } catch (err) {
        console.error('Ошибка при получении прогресса видео:', err);
      }
    };

    if (videoRef.current && videoRef.current.readyState > 0) {
      fetchVideoProgress();
    }
  }, [videoId, user, videoUrl]);

  // Обработка событий видео
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      if (!videoElement) return;
      
      const duration = videoElement.duration;
      if (isNaN(duration)) return;
      
      const currentTime = videoElement.currentTime;
      const progress = Math.floor((currentTime / duration) * 100);
      
      setCurrentProgress(progress);
      
      if (onProgress) {
        onProgress(progress);
      }
      
      // Если прогресс больше 90%, считаем видео просмотренным
      if (progress >= 90 && onComplete) {
        onComplete();
      }
    };

    const handleEnded = () => {
      if (onComplete) {
        onComplete();
      }
    };

    // Добавляем обработчики событий
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);

    // Настраиваем интервал для отправки прогресса на сервер
    progressInterval.current = window.setInterval(() => {
      if (!user || !videoElement) return;
      
      const duration = videoElement.duration;
      if (isNaN(duration)) return;
      
      const currentTime = videoElement.currentTime;
      const progress = Math.floor((currentTime / duration) * 100);
      
      // Отправляем прогресс на сервер каждые 10 секунд
      fetch(`${API_URL}/api/videos/mark-watched/${videoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          progress,
          lessonId,
        }),
      }).catch(err => {
        console.error('Ошибка при отправке прогресса:', err);
      });
    }, 10000); // Каждые 10 секунд

    return () => {
      // Удаляем обработчики событий при размонтировании
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      
      // Очищаем интервал
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      // Отправляем финальный прогресс при размонтировании
      if (user && currentProgress > 0) {
        fetch(`${API_URL}/api/videos/mark-watched/${videoId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            progress: currentProgress,
            lessonId,
          }),
        }).catch(err => {
          console.error('Ошибка при отправке финального прогресса:', err);
        });
      }
    };
  }, [videoId, user, onProgress, onComplete, lessonId, currentProgress]);

  // Обработчик события загрузки метаданных видео
  const handleLoadedMetadata = () => {
    if (videoRef.current && user) {
      // Получаем прогресс просмотра после загрузки метаданных
      fetch(`${API_URL}/api/videos/progress/${videoId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then(response => {
          if (response.ok) return response.json();
          throw new Error('Не удалось получить прогресс');
        })
        .then(data => {
          if (data.progress && videoRef.current) {
            const duration = videoRef.current.duration;
            videoRef.current.currentTime = (data.progress / 100) * duration;
            setCurrentProgress(data.progress);
          }
        })
        .catch(err => {
          console.error('Ошибка при получении прогресса:', err);
        });
    }
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
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={videoUrl || undefined}
        className="w-full rounded-lg"
        controls
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
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