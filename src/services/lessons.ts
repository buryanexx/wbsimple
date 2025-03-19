import api from './api';

export const getLessons = async (moduleId: number) => {
  const response = await api.get(`/admin/modules/${moduleId}/lessons`);
  return response.data;
};

export const getLesson = async (id: number) => {
  const response = await api.get(`/admin/lessons/${id}`);
  return response.data;
};

export const createLesson = async (moduleId: number, lessonData: any) => {
  const response = await api.post(`/admin/modules/${moduleId}/lessons`, lessonData);
  return response.data;
};

export const updateLesson = async ({ id, ...lessonData }: { id: number; [key: string]: any }) => {
  const response = await api.put(`/admin/lessons/${id}`, lessonData);
  return response.data;
};

export const deleteLesson = async (id: number) => {
  const response = await api.delete(`/admin/lessons/${id}`);
  return response.data;
}; 