import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { makeServer } from './utils/mock-api';

// Запускаем моковый сервер только в режиме разработки
if (import.meta.env.DEV) {
  makeServer({ environment: 'development' });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 