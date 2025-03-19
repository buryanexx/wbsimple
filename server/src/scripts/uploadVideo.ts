import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import readline from 'readline';

// Загружаем переменные окружения
dotenv.config();

// Директория для хранения видео
const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(process.cwd(), 'videos');

// Создаем директорию для видео, если она не существует
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// Интерфейс для чтения ввода пользователя
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Загружает видео в директорию для видео
 * @param sourcePath - Путь к исходному видеофайлу
 * @param videoId - ID видео (если не указан, будет сгенерирован)
 * @returns ID видео
 */
const uploadVideo = (sourcePath: string, videoId?: string): string => {
  // Проверяем, существует ли исходный файл
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Файл не найден: ${sourcePath}`);
  }

  // Генерируем ID видео, если он не указан
  const id = videoId || uuidv4();
  
  // Путь к целевому файлу
  const targetPath = path.join(VIDEOS_DIR, `${id}.mp4`);
  
  // Копируем файл
  fs.copyFileSync(sourcePath, targetPath);
  
  console.log(`Видео успешно загружено с ID: ${id}`);
  console.log(`Путь к файлу: ${targetPath}`);
  
  return id;
};

/**
 * Удаляет видео из директории для видео
 * @param videoId - ID видео
 */
const deleteVideo = (videoId: string): void => {
  // Путь к файлу
  const filePath = path.join(VIDEOS_DIR, `${videoId}.mp4`);
  
  // Проверяем, существует ли файл
  if (!fs.existsSync(filePath)) {
    throw new Error(`Видео не найдено: ${videoId}`);
  }
  
  // Удаляем файл
  fs.unlinkSync(filePath);
  
  console.log(`Видео успешно удалено: ${videoId}`);
};

/**
 * Получает список всех видео
 * @returns Список ID видео
 */
const listVideos = (): string[] => {
  // Получаем список файлов в директории
  const files = fs.readdirSync(VIDEOS_DIR);
  
  // Фильтруем только MP4 файлы и извлекаем ID
  const videoIds = files
    .filter(file => file.endsWith('.mp4'))
    .map(file => file.replace('.mp4', ''));
  
  return videoIds;
};

/**
 * Запускает интерактивный режим
 */
const interactive = (): void => {
  console.log('=== Управление видео ===');
  console.log('1. Загрузить видео');
  console.log('2. Удалить видео');
  console.log('3. Список видео');
  console.log('4. Выход');
  
  rl.question('Выберите действие (1-4): ', (answer) => {
    switch (answer) {
      case '1':
        rl.question('Путь к видеофайлу: ', (sourcePath) => {
          rl.question('ID видео (оставьте пустым для автоматической генерации): ', (videoId) => {
            try {
              uploadVideo(sourcePath, videoId || undefined);
            } catch (error) {
              console.error(`Ошибка: ${(error as Error).message}`);
            }
            interactive();
          });
        });
        break;
      
      case '2':
        rl.question('ID видео для удаления: ', (videoId) => {
          try {
            deleteVideo(videoId);
          } catch (error) {
            console.error(`Ошибка: ${(error as Error).message}`);
          }
          interactive();
        });
        break;
      
      case '3':
        const videos = listVideos();
        console.log('=== Список видео ===');
        if (videos.length === 0) {
          console.log('Нет загруженных видео');
        } else {
          videos.forEach((id, index) => {
            console.log(`${index + 1}. ${id}`);
          });
        }
        interactive();
        break;
      
      case '4':
        console.log('Выход из программы');
        rl.close();
        break;
      
      default:
        console.log('Неверный выбор');
        interactive();
        break;
    }
  });
};

// Запускаем интерактивный режим, если скрипт запущен напрямую
if (require.main === module) {
  interactive();
}

export {
  uploadVideo,
  deleteVideo,
  listVideos
}; 