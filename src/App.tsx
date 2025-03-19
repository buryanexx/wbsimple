import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth.tsx';
import BottomNavigation from './components/BottomNavigation';

// Страницы
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import ModulesPage from './pages/ModulesPage';
import LessonPage from './pages/LessonPage';
import TemplatesPage from './pages/TemplatesPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ProfilePage from './pages/ProfilePage';
import ChannelPage from './pages/ChannelPage';
import CalculatorPage from './pages/CalculatorPage';
import WildberriesCalculatorPage from './pages/WildberriesCalculatorPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import TimelinePage from './pages/TimelinePage';
import MasterClassPage from './pages/MasterClassPage';

// Расширяем глобальный тип Window для Telegram WebApp
declare global {
  interface Window {
    tgInitComplete?: boolean;
    reactAppMounted?: boolean;
    pendingNavigationPath?: string;
    safeTelegramNavigation?: (path: string) => void;
    tgWebAppLogs?: any[];
    tgWebAppErrors?: any[];
  }
  
  // Определяем интерфейс для CustomEvent с detail
  interface TelegramHashChangeEvent extends CustomEvent {
    detail: {
      hash: string;
    };
  }
}

// Защищенный маршрут
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-[#6A45E8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Компонент для обработки инициализации приложения
const AppInitializer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Выполняется только один раз при монтировании компонента
  useEffect(() => {
    // Маркируем, что React приложение смонтировано
    window.reactAppMounted = true;
    
    console.log('React приложение инициализировано, текущий путь:', location.pathname);
    
    // Проверяем, есть ли отложенная навигация
    if (window.pendingNavigationPath) {
      const path = window.pendingNavigationPath;
      window.pendingNavigationPath = undefined; // Очищаем
      
      console.log('Обрабатываем отложенную навигацию:', path);
      
      // Используем setTimeout, чтобы дать время на инициализацию роутера
      setTimeout(() => {
        navigate(path, { replace: true });
      }, 100);
    }
    
    // Синхронизируем текущий путь с хешем в URL
    const currentHashPath = window.location.hash.replace('#', '') || '/';
    if (currentHashPath !== location.pathname && currentHashPath !== '/') {
      console.log('Синхронизируем путь с хешем:', currentHashPath);
      navigate(currentHashPath, { replace: true });
    }
    
    // Слушаем изменения хеша для внешних источников
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      
      console.log('Обработчик hashchange:', hash, 'текущий путь:', location.pathname);
      
      if (hash !== location.pathname) {
        console.log('Обновляем путь из-за изменения хеша');
        navigate(hash, { replace: true });
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.reactAppMounted = false;
    };
  }, [navigate, location.pathname]);
  
  return null; // Компонент не рендерит ничего
};

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Дожидаемся инициализации Telegram WebApp
    const checkTelegramReady = () => {
      if (window.tgInitComplete) {
        setAppReady(true);
      } else {
        setTimeout(checkTelegramReady, 50);
      }
    };
    
    checkTelegramReady();
    
    // Применяем тему Telegram к приложению
    document.documentElement.classList.add('telegram-theme');
    
    return () => {
      document.documentElement.classList.remove('telegram-theme');
    };
  }, []);

  // Показываем загрузку, пока не инициализирован Telegram WebApp
  if (!appReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-[#6A45E8] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Загрузка приложения...</p>
      </div>
    );
  }

  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white telegram-page-transition">
      {/* Инициализатор приложения */}
      <AppInitializer />
      
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/wb-calculator" element={<WildberriesCalculatorPage />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
        <Route path="/master-class" element={<MasterClassPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        
        {/* Защищенные маршруты */}
        <Route path="/modules" element={
          <ProtectedRoute>
            <ModulesPage />
          </ProtectedRoute>
        } />
        <Route path="/lesson/:moduleId/:lessonId" element={
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        } />
        <Route path="/templates" element={
          <ProtectedRoute>
            <TemplatesPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/channel" element={
          <ProtectedRoute>
            <ChannelPage />
          </ProtectedRoute>
        } />
        
        {/* Маршрут для 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Нижняя навигация - отображаем всегда, кроме экрана загрузки */}
      {!loading && (
        <BottomNavigation />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
