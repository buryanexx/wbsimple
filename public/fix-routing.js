/**
 * Файл для быстрой проверки и исправления роутинга при загрузке приложения
 * Подключается перед React для исправления URL до инициализации React Router
 */

// Функция для быстрой проверки URL и исправления маршрутизации
(function() {
  console.log('Запуск fix-routing.js v2');
  
  // Исправляем проблему с навигацией
  function fixNavigation() {
    // Проверяем текущий URL
    const url = window.location.href;
    const host = window.location.host;
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    
    console.log('URL:', url);
    console.log('Pathname:', pathname);
    console.log('Hash:', hash);
    
    // Нужно ли исправлять URL?
    const needsFixing = (hash === '#/' || hash === '#') && pathname === '/';
    
    if (needsFixing) {
      console.log('Исправляем пустой хеш...');
      // Удаляем пустой хеш из URL без перезагрузки страницы
      try {
        window.history.replaceState(null, '', '/');
      } catch (e) {
        console.error('Ошибка при исправлении URL:', e);
      }
    }
  }
  
  // Запускаем проверку с небольшой задержкой, чтобы страница успела загрузиться
  setTimeout(fixNavigation, 100);
  
  // Также исправляем после загрузки страницы
  window.addEventListener('load', fixNavigation);
  
  // И после изменения хеша
  window.addEventListener('hashchange', function() {
    console.log('Изменение хеша:', window.location.hash);
    if (window.location.hash === '#/' || window.location.hash === '#') {
      console.log('Обнаружен пустой хеш, исправляем...');
      window.history.replaceState(null, '', '/');
    }
  });
})(); 