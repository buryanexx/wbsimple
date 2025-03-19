/**
 * Простой сервер для авторизации через Telegram WebApp
 * Для демонстрации работы системы
 */
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3002;

// Секретный токен бота (в реальном проекте должен храниться в переменных окружения)
const BOT_TOKEN = '5348958034:AAF4dQBFLp3hqTd9GxGP1dQvgF_JXLM0C9c';

// База данных пользователей (в реальном проекте должна быть заменена на настоящую БД)
const users = {
  123456789: { // ID пользователя в Telegram
    id: 1,
    telegramId: 123456789,
    firstName: 'Иван',
    lastName: 'Иванов',
    username: 'ivanov',
    isAdmin: true,
    hasActiveSubscription: true,
    subscriptionEndDate: '2024-12-31',
    progress: {
      completedLessons: [1, 2, 3],
      completedModules: [1]
    }
  }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Функция для проверки подписи данных Telegram WebApp
function validateTelegramWebAppData(initData) {
  // Парсим initData
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  
  if (!hash) return false;
  
  // Удаляем hash из данных для проверки
  urlParams.delete('hash');
  
  // Сортируем параметры по ключу в алфавитном порядке
  const dataCheckArray = [];
  for (const [key, value] of [...urlParams.entries()].sort()) {
    dataCheckArray.push(`${key}=${value}`);
  }
  
  const dataCheckString = dataCheckArray.join('\n');
  
  // Создаем HMAC-SHA-256 с секретным ключом бота
  const secretKey = crypto.createHash('sha256')
    .update(BOT_TOKEN)
    .digest();
  
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  // Сравниваем полученный хеш с переданным
  return hmac === hash;
}

// Роут для проверки статуса сервера
app.get('/', (req, res) => {
  res.json({ message: 'Сервер аутентификации работает' });
});

// Роут для авторизации через Telegram
app.post('/auth/telegram', (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({ message: 'Отсутствуют данные инициализации' });
    }
    
    // Проверяем подпись данных
    const isValid = validateTelegramWebAppData(initData);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Неверная подпись данных инициализации' });
    }
    
    // Парсим данные пользователя
    const urlParams = new URLSearchParams(initData);
    const userRaw = urlParams.get('user');
    
    if (!userRaw) {
      return res.status(400).json({ message: 'Данные пользователя отсутствуют' });
    }
    
    const telegramUser = JSON.parse(userRaw);
    const telegramId = telegramUser.id;
    
    // Ищем пользователя в нашей "базе" или создаем нового
    let user = users[telegramId];
    
    if (!user) {
      // Это новый пользователь, создаем его
      const newUserId = Object.keys(users).length + 1;
      user = {
        id: newUserId,
        telegramId: telegramId,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || '',
        username: telegramUser.username || '',
        photoUrl: telegramUser.photo_url || '',
        isAdmin: false,
        hasActiveSubscription: false,
        progress: {
          completedLessons: [],
          completedModules: []
        }
      };
      
      // Сохраняем в нашу "базу"
      users[telegramId] = user;
    }
    
    // Генерируем простой JWT-подобный токен (в реальном проекте следует использовать настоящий JWT)
    const token = crypto.randomBytes(32).toString('hex');
    
    return res.json({
      user,
      token,
      expires: Date.now() + 86400000 // Токен действителен 24 часа
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Роут для проверки токена
app.get('/auth/check', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  
  // В реальном проекте должна быть проверка настоящего JWT-токена
  // Для простоты демо возвращаем успешный ответ
  return res.json({ valid: true });
});

// Роут для ручного входа (для тестирования)
app.post('/auth/login', (req, res) => {
  try {
    const { telegramId } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ message: 'Отсутствует ID пользователя Telegram' });
    }
    
    // Ищем пользователя в нашей "базе"
    const user = users[telegramId];
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Генерируем простой токен
    const token = crypto.randomBytes(32).toString('hex');
    
    return res.json({
      user,
      token,
      expires: Date.now() + 86400000 // Токен действителен 24 часа
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер аутентификации запущен на порту ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
}); 