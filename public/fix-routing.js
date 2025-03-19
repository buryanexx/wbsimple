/**
 * Файл для быстрой проверки и исправления роутинга при загрузке приложения
 * Подключается перед React для исправления URL до инициализации React Router
 */

// Функция для быстрой проверки URL и исправления маршрутизации
(function() {
  console.log('Запуск fix-routing.js');
  
  // Текущий URL
  const currentHash = window.location.hash;
  const currentPath = window.location.pathname;
  
  console.log('Проверка URL:', {
    hash: currentHash,
    path: currentPath,
    fullUrl: window.location.href
  });
  
  // Если есть обычный путь (кроме корневого), но нет хеша, 
  // преобразуем его в хеш-путь
  if (currentPath !== '/' && currentPath !== '' && !currentHash) {
    console.log('Преобразование обычного пути в хеш:', currentPath);
    window.location.replace('/#' + currentPath);
    return;
  }
  
  // Если хеш есть, но он пустой, убираем его
  if (currentHash === '#' || currentHash === '#/') {
    console.log('Удаление пустого хеша');
    window.location.replace('./');
    return;
  }
  
  // Если хеш есть и он не пустой, оставляем как есть
  if (currentHash && currentHash !== '#' && currentHash !== '#/') {
    console.log('URL выглядит корректным:', window.location.href);
    return;
  }
  
  console.log('Проверка URL завершена без изменений');
})(); 