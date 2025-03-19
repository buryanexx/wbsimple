export interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  lessonsCount?: number;
}

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  order: number;
  videoUrl?: string;
  materialUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  telegramId?: string;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  email?: string;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  subscriptionEndDate?: string;
  autoRenewal?: boolean;
  progress?: {
    completedLessons: number[];
    completedModules: number[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: 'video' | 'material';
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  totalUsers: number;
  activeSubscriptions: number;
  completedLessons: number;
  userGrowth: {
    date: string;
    count: number;
  }[];
  subscriptionData: {
    date: string;
    active: number;
    expired: number;
  }[];
  moduleCompletionRates: {
    moduleId: number;
    moduleTitle: string;
    completionRate: number;
  }[];
} 