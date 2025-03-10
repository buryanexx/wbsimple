import React, { createContext, useContext, ReactNode } from 'react';
import useAuth from '../hooks/useAuth';

// Создаем контекст
const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);

// Провайдер контекста
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 