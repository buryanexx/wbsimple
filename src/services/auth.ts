import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    isAdmin: boolean;
    firstName: string;
    lastName?: string;
    photoUrl?: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/admin/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/admin/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('admin_token');
}; 