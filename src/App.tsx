import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WebAppProvider, useWebApp } from '@vkruglikov/react-telegram-web-app';
import { AuthProvider } from './contexts/AuthContext';

// Импорт страниц
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ModulesPage from './pages/ModulesPage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import TemplatesPage from './pages/TemplatesPage';
import ChannelPage from './pages/ChannelPage';
import CalculatorPage from './pages/CalculatorPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import TimelinePage from './pages/TimelinePage';

// Импорт компонентов
import BottomNavigation from './components/BottomNavigation';
import ProtectedRoute from './components/ProtectedRoute';

// Компонент для настройки темы Telegram
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const webApp = useWebApp();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (webApp) {
      // Получаем параметры темы из Telegram WebApp
      const themeParams = webApp.themeParams;
      setIsDarkTheme(themeParams?.bg_color === '#212121');
      
      // Устанавливаем цвет заголовка
      webApp.setHeaderColor(isDarkTheme ? '#212121' : '#7B68EE');
      
      // Устанавливаем цвет фона
      webApp.setBackgroundColor(isDarkTheme ? '#212121' : '#F5F5F5');
    }
  }, [webApp, isDarkTheme]);

  return (
    <div className={isDarkTheme ? 'dark' : 'light'}>
      {children}
    </div>
  );
};

function App() {
  return (
    <WebAppProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/modules" element={<ModulesPage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/success-stories" element={<SuccessStoriesPage />} />
                <Route 
                  path="/lesson/:moduleId/:lessonId" 
                  element={<LessonPage />} 
                />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route 
                  path="/channel" 
                  element={
                    <ProtectedRoute>
                      <ChannelPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <BottomNavigation />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </WebAppProvider>
  );
}

export default App;
