import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.tsx';
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

// Защищенный маршрут
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    // Применяем тему Telegram к приложению
    document.documentElement.classList.add('telegram-theme');
    
    return () => {
      document.documentElement.classList.remove('telegram-theme');
    };
  }, []);

  return (
    <Router>
      <div className="app min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<HomePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/wb-calculator" element={<WildberriesCalculatorPage />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/master-class" element={<MasterClassPage />} />
          
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
          <Route path="/timeline" element={
            <ProtectedRoute>
              <TimelinePage />
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
    </Router>
  );
}

export default App;
