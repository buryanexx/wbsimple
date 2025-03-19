import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './hooks/useAuth.tsx'

// Инициализируем приложение с минимальной задержкой, чтобы Telegram WebApp успел инициализироваться
setTimeout(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
  )
  
  // Уведомляем о завершении монтирования React приложения
  if (window.reactAppMounted !== undefined) {
    window.reactAppMounted = true;
    console.log('React приложение полностью смонтировано');
  }
}, 50);

// Сообщаем о запуске скрипта
console.log('main.tsx выполняется, инициализация React...');
