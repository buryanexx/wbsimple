import api from './api';

export const getMedia = async () => {
  const response = await api.get('/admin/media');
  return response.data;
};

export const uploadVideo = async (file: File, onProgress?: (progressEvent: any) => void) => {
  const formData = new FormData();
  formData.append('video', file);

  const response = await api.post('/admin/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });

  return response.data.videoId;
};

export const uploadMaterial = async (file: File, type: string, onProgress?: (progressEvent: any) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await api.post('/admin/upload/material', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });

  return response.data.materialId;
};

export const deleteMedia = async (id: string) => {
  const response = await api.delete(`/admin/media/${id}`);
  return response.data;
}; 