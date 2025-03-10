import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
}

const ProtectedRoute = ({ children, requireSubscription = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuthContext();
  
  // Если данные еще загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Если пользователь не авторизован, перенаправляем на главную страницу
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Если требуется подписка и у пользователя ее нет, перенаправляем на страницу подписки
  if (requireSubscription && !user.isSubscribed) {
    return <Navigate to="/subscription" replace />;
  }
  
  // Если все проверки пройдены, отображаем защищенный контент
  return <>{children}</>;
};

export default ProtectedRoute; 