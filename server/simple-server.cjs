const express = require('express');
const app = express();
const PORT = 5004; // Используем другой порт

// Middleware
app.use(express.json());

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'WB Simple API работает!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 