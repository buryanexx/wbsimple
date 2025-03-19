// Актуальные комиссии и тарифы Wildberries на 2024 год

export interface CategoryCommission {
  name: string;            // Название категории
  subCategories?: CategoryCommission[]; // Подкатегории
  commissionFBO: number;   // Комиссия FBO (%)
  commissionFBS: number;   // Комиссия FBS (%)
}

// Логистические тарифы
export interface LogisticsTariffs {
  baseFirstLiter: number;  // Базовый тариф за первый литр
  baseAdditionalLiter: number; // Базовый тариф за каждый дополнительный литр
  fbsMultiplier: number;   // Множитель для FBS-логистики
  returnCost: number;      // Стоимость обратной логистики
}

// Хранение
export interface StorageTariffs {
  boxFirstLiter: number;   // Стоимость хранения короба за первый литр в сутки
  boxAdditionalLiter: number; // Стоимость хранения короба за каждый дополнительный литр в сутки
  pallet: number;          // Стоимость хранения паллеты в сутки
}

// Актуальные тарифы логистики
export const logisticsTariffs: LogisticsTariffs = {
  baseFirstLiter: 38,
  baseAdditionalLiter: 9.5,
  fbsMultiplier: 1.25, // 125% от базы с 28.02.2025
  returnCost: 50,
};

// Актуальные тарифы хранения
export const storageTariffs: StorageTariffs = {
  boxFirstLiter: 0.08,
  boxAdditionalLiter: 0.08,
  pallet: 25,
};

// Основные категории товаров и их комиссии
export const categories: CategoryCommission[] = [
  {
    name: "Одежда и аксессуары",
    commissionFBO: 24.5,
    commissionFBS: 24.5,
    subCategories: [
      { name: "Футболки", commissionFBO: 24.5, commissionFBS: 24.5 },
      { name: "Брюки", commissionFBO: 24.5, commissionFBS: 24.5 },
      { name: "Верхняя одежда", commissionFBO: 24.5, commissionFBS: 24.5 },
      { name: "Аксессуары", commissionFBO: 24.5, commissionFBS: 24.5 }
    ]
  },
  {
    name: "Спортивная одежда",
    commissionFBO: 24.5,
    commissionFBS: 24.5,
    subCategories: [
      { name: "Футболки спортивные", commissionFBO: 24.5, commissionFBS: 24.5 },
      { name: "Штаны спортивные", commissionFBO: 24.5, commissionFBS: 24.5 },
      { name: "Купальники", commissionFBO: 24.5, commissionFBS: 24.5 }
    ]
  },
  {
    name: "Спортивные товары",
    commissionFBO: 17.5,
    commissionFBS: 17.5,
    subCategories: [
      { name: "Тренажеры", commissionFBO: 17.5, commissionFBS: 17.5 },
      { name: "Спортивный инвентарь", commissionFBO: 17.5, commissionFBS: 17.5 },
      { name: "Товары для фитнеса", commissionFBO: 17.5, commissionFBS: 17.5 }
    ]
  },
  {
    name: "Красота и здоровье",
    commissionFBO: 22.5,
    commissionFBS: 22.5,
    subCategories: [
      { name: "Косметика", commissionFBO: 22.5, commissionFBS: 22.5 },
      { name: "Парфюмерия", commissionFBO: 22.5, commissionFBS: 22.5 },
      { name: "Средства гигиены", commissionFBO: 22.5, commissionFBS: 22.5 }
    ]
  },
  {
    name: "Товары для дома",
    commissionFBO: 19.5,
    commissionFBS: 19.5,
    subCategories: [
      { name: "Текстиль", commissionFBO: 19.5, commissionFBS: 19.5 },
      { name: "Посуда", commissionFBO: 19.5, commissionFBS: 19.5 },
      { name: "Декор", commissionFBO: 19.5, commissionFBS: 19.5 }
    ]
  },
  {
    name: "Электроника",
    commissionFBO: 14.5,
    commissionFBS: 14.5,
    subCategories: [
      { name: "Смартфоны", commissionFBO: 14.5, commissionFBS: 14.5 },
      { name: "Компьютерная техника", commissionFBO: 14.5, commissionFBS: 14.5 },
      { name: "Аксессуары для техники", commissionFBO: 14.5, commissionFBS: 14.5 }
    ]
  },
  {
    name: "Продукты",
    commissionFBO: 11.5,
    commissionFBS: 11.5,
    subCategories: [
      { name: "Снеки", commissionFBO: 11.5, commissionFBS: 11.5 },
      { name: "Сладости", commissionFBO: 11.5, commissionFBS: 11.5 },
      { name: "Напитки", commissionFBO: 11.5, commissionFBS: 11.5 }
    ]
  },
  {
    name: "Детские товары",
    commissionFBO: 19.5,
    commissionFBS: 19.5,
    subCategories: [
      { name: "Игрушки", commissionFBO: 19.5, commissionFBS: 19.5 },
      { name: "Детская одежда", commissionFBO: 19.5, commissionFBS: 19.5 },
      { name: "Товары для новорожденных", commissionFBO: 19.5, commissionFBS: 19.5 }
    ]
  },
  {
    name: "Книги и канцтовары",
    commissionFBO: 14.5,
    commissionFBS: 14.5,
    subCategories: [
      { name: "Книги", commissionFBO: 14.5, commissionFBS: 14.5 },
      { name: "Канцелярские товары", commissionFBO: 14.5, commissionFBS: 14.5 },
      { name: "Товары для творчества", commissionFBO: 14.5, commissionFBS: 14.5 }
    ]
  }
];

// Коэффициенты складов (по умолчанию)
export const warehouseCoefficients = {
  default: 1.0, // Значение по умолчанию
  korolev: 1.2,
  podolsk: 1.1,
  elektrostal: 1.15,
  novosibirsk: 1.3,
  krasnodar: 1.25
};

// Коэффициенты габаритов
export interface SizeCoefficients {
  standard: number; // Обычный товар
  oversized: number; // Крупногабаритный товар
}

export const sizeCoefficients: SizeCoefficients = {
  standard: 1.0,
  oversized: 2.5 // Для крупногабаритных товаров
}; 