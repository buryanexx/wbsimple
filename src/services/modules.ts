import api from './api';

export const getModules = async () => {
  const response = await api.get('/admin/modules');
  return response.data;
};

export const getModule = async (id: number) => {
  const response = await api.get(`/admin/modules/${id}`);
  return response.data;
};

export const createModule = async (moduleData: any) => {
  const response = await api.post('/admin/modules', moduleData);
  return response.data;
};

export const updateModule = async ({ id, ...moduleData }: { id: number; [key: string]: any }) => {
  const response = await api.put(`/admin/modules/${id}`, moduleData);
  return response.data;
};

export const deleteModule = async (id: number) => {
  const response = await api.delete(`/admin/modules/${id}`);
  return response.data;
}; 