import api from './api';

export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getUser = async (id: number) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async ({ id, ...userData }: { id: number; [key: string]: any }) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const updateUserSubscription = async (
  id: number, 
  subscriptionData: { 
    hasActiveSubscription: boolean; 
    subscriptionEndDate?: string; 
    autoRenewal?: boolean;
  }
) => {
  const response = await api.put(`/admin/users/${id}/subscription`, subscriptionData);
  return response.data;
}; 