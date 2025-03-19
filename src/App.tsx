import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth.tsx';
import BottomNavigation from './components/BottomNavigation';
import { config } from './config.ts';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

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
    safeTelegramNavigation?: (path: string) => boolean;
    tgWebAppLogs?: any[];
    tgWebAppErrors?: any[];
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

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const webApp = useWebApp();
  const navigate = useNavigate();
  const location = useLocation();
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
    
    // Настраиваем BackButton для хеш-роутинга
    if (webApp?.BackButton) {
      const path = location.pathname;
      
      if (path !== '/') {
        webApp.BackButton.show();
        
        // Обработчик кнопки "Назад"
        webApp.BackButton.onClick(() => {
          navigate('/');
          return true; // Чтобы соответствовать типу (path: string) => boolean
        });
      } else {
        webApp.BackButton.hide();
      }
    }
    
    return () => {
      document.documentElement.classList.remove('telegram-theme');
    };
  }, [location.pathname, webApp, navigate]);

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
  // Используем HashRouter для максимальной совместимости с Telegram WebApp
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
