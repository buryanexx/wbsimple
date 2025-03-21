import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';

// Интерфейс для подписки
export interface Subscription {
  isActive: boolean;
  endDate: Date | null;
  plan: 'basic' | 'premium' | 'none';
  features: string[];
  autoRenewal: boolean;
}

// Доступные функции для каждого типа подписки
const SUBSCRIPTION_FEATURES = {
  basic: [
    'Доступ к модулям с основами бизнеса',
    'Базовые шаблоны документов',
    'Доступ к сообществу',
  ],
  premium: [
    'Доступ ко всем модулям обучения',
    'Все шаблоны документов и инструменты',
    'Персональные консультации',
    'Доступ к закрытому сообществу',
    'Приоритетная поддержка'
  ],
  none: [
    'Ограниченный доступ к модулям',
    'Демо-версии шаблонов',
  ]
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>({
    isActive: false,
    endDate: null,
    plan: 'none',
    features: SUBSCRIPTION_FEATURES.none,
    autoRenewal: false
  });

  // Обновляем состояние подписки при изменении пользователя
  useEffect(() => {
    if (!user) {
      setSubscription({
        isActive: false,
        endDate: null,
        plan: 'none',
        features: SUBSCRIPTION_FEATURES.none,
        autoRenewal: false
      });
      return;
    }

    const isActive = user.hasActiveSubscription;
    const endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const autoRenewal = user.autoRenewal || false;
    
    // Определяем тип плана (можно расширить логику)
    const plan = isActive ? 'premium' : 'none';
    
    setSubscription({
      isActive,
      endDate,
      plan,
      features: isActive ? SUBSCRIPTION_FEATURES.premium : SUBSCRIPTION_FEATURES.none,
      autoRenewal
    });
  }, [user]);

  // Проверяем, имеет ли пользователь доступ к определенному контенту
  const hasAccess = (contentType: 'modules' | 'lessons' | 'templates' | 'premium') => {
    if (!user) return false;
    
    // Базовая логика для различных типов контента
    switch (contentType) {
      case 'modules':
        // Все пользователи имеют доступ к просмотру модулей
        return true;
      case 'lessons':
        // Уроки доступны только с активной подпиской
        return subscription.isActive;
      case 'templates':
        // Шаблоны доступны только с активной подпиской
        return subscription.isActive;
      case 'premium':
        // Премиум-контент требует активной подписки
        return subscription.isActive && subscription.plan === 'premium';
      default:
        return false;
    }
  };

  // Форматируем дату окончания подписки
  const getFormattedEndDate = () => {
    if (!subscription.endDate) return 'не указано';
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(subscription.endDate);
  };

  // Получаем дни до окончания подписки
  const getDaysRemaining = () => {
    if (!subscription.endDate || !subscription.isActive) return 0;
    
    const today = new Date();
    const endDate = new Date(subscription.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  return {
    subscription,
    hasAccess,
    getFormattedEndDate,
    getDaysRemaining,
    features: SUBSCRIPTION_FEATURES
  };
}; 