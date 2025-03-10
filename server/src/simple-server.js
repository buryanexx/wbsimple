import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: '.env.development' });

const app = express();
const PORT = 5003; // Используем другой порт

// Middleware
app.use(cors());
app.use(express.json());

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'WB Simple API работает!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 