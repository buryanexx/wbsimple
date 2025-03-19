/**
 * Простой сервер для авторизации через Telegram WebApp
 * Для демонстрации работы системы
 */
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Секретный ключ бота Telegram для проверки initData
// В реальной системе нужно использовать BOT_TOKEN из env
const BOT_SECRET = '5348958034:AAF4dQBFLp3hqTd9GxGP1dQvgF_JXLM0C9c';

// Временная база данных пользователей (для демонстрации)
const usersDB = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());

/**
 * Проверка подписи данных из Telegram WebApp
 * @param {Object} data - Объект с данными из initData
 * @param {string} hash - Хеш для проверки
 */
function verifyTelegramWebAppData(data, hash) {
  // Удаляем hash из данных для подписи
  const dataCheckString = Object.keys(data)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');

  // Создаем проверочный хеш
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_SECRET).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return calculatedHash === hash;
}

/**
 * Парсинг initData из Telegram WebApp
 * @param {string} initDataString - Строка initData из Telegram WebApp
 */
function parseInitData(initDataString) {
  if (!initDataString) return null;

  const params = new URLSearchParams(initDataString);
  const result = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
}

// Авторизация через Telegram WebApp
app.post('/auth/telegram', (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ success: false, message: 'Отсутствуют данные initData' });
    }

    // Парсим данные
    const parsedData = parseInitData(initData);
    
    if (!parsedData) {
      return res.status(400).json({ success: false, message: 'Неверный формат initData' });
    }

    // В реальном приложении здесь должна быть проверка подписи
    // В демо пропускаем эту проверку
    // if (!verifyTelegramWebAppData(parsedData, parsedData.hash)) {
    //   return res.status(403).json({ success: false, message: 'Недействительная подпись' });
    // }

    // Проверяем, есть ли пользовательские данные
    if (!parsedData.user) {
      return res.status(400).json({ success: false, message: 'Отсутствуют данные пользователя' });
    }

    // Преобразуем строку user в объект
    const user = JSON.parse(parsedData.user);

    // Проверяем, есть ли пользователь в базе
    let existingUser = usersDB.find(u => u.telegramId === user.id);

    if (!existingUser) {
      // Создаем нового пользователя
      const newUser = {
        id: usersDB.length + 1,
        telegramId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: user.photo_url,
        isAdmin: false,
        hasActiveSubscription: false,
        registeredAt: new Date(),
        progress: {
          completedLessons: [],
          completedModules: []
        }
      };

      usersDB.push(newUser);
      existingUser = newUser;
    }

    // Генерируем JWT токен (для демонстрации упрощенно)
    const token = crypto.randomBytes(64).toString('hex');

    return res.status(200).json({
      success: true,
      token,
      user: existingUser
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});

// Проверка токена
app.get('/auth/check', (req, res) => {
  try {
    // В реальном приложении здесь должна быть проверка JWT токена
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Токен отсутствует' });
    }

    // Для демонстрации всегда возвращаем успех
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});

// Вход по telegramId (для тестирования)
app.post('/auth/login', (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({ success: false, message: 'Отсутствует telegramId' });
    }

    // Ищем пользователя в базе
    const user = usersDB.find(u => u.telegramId === telegramId);

    if (!user) {
      // Создаем тестового пользователя
      const newUser = {
        id: usersDB.length + 1,
        telegramId,
        firstName: 'Тестовый',
        lastName: 'Пользователь',
        username: 'test_user',
        isAdmin: false,
        hasActiveSubscription: true,
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        progress: {
          completedLessons: [],
          completedModules: []
        }
      };

      usersDB.push(newUser);
      
      // Генерируем токен
      const token = crypto.randomBytes(64).toString('hex');

      return res.status(200).json({
        success: true,
        token,
        user: newUser
      });
    }

    // Генерируем токен для существующего пользователя
    const token = crypto.randomBytes(64).toString('hex');

    return res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 