import api from './api';
import { AnalyticsData } from '../types';

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

export const getUserGrowth = async (period: 'week' | 'month' | 'year' = 'month') => {
  const response = await api.get(`/admin/analytics/user-growth?period=${period}`);
  return response.data;
};

export const getSubscriptionData = async (period: 'week' | 'month' | 'year' = 'month') => {
  const response = await api.get(`/admin/analytics/subscriptions?period=${period}`);
  return response.data;
};

export const getModuleCompletionRates = async () => {
  const response = await api.get('/admin/analytics/module-completion');
  return response.data;
};

export const getLessonCompletionRates = async (moduleId?: number) => {
  const url = moduleId 
    ? `/admin/analytics/lesson-completion?moduleId=${moduleId}`
    : '/admin/analytics/lesson-completion';
  const response = await api.get(url);
  return response.data;
}; 