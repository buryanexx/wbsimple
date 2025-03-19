import { 
  categories, 
  logisticsTariffs, 
  storageTariffs, 
  warehouseCoefficients,
  sizeCoefficients
} from '../data/wb-commissions';

// Тип поставки
export type SupplyType = 'FBO' | 'FBS';

// Интерфейс для параметров расчета
export interface CalculationParams {
  // Базовые параметры
  productCategory: string;
  subCategory?: string;
  volume: number; // Объем товара в литрах
  supplyType: SupplyType;
  warehouse: string;
  isOversized: boolean;
  
  // Параметры для расчета хранения
  storageVolume: number; // Общий объем хранения в литрах
  storageDays: number; // Количество дней хранения
  isPallet: boolean; // Паллетное хранение
  palletCount: number; // Количество паллет
  
  // Параметры для расчета дохода/прибыли
  purchasePrice: number; // Закупочная цена
  sellingPrice: number; // Цена продажи
  quantity: number; // Количество единиц товара
  selloutPercentage: number; // Процент выкупа (0-100)
}

// Интерфейс результатов расчета
export interface CalculationResults {
  // Комиссии
  commissionPercent: number; // Комиссия WB (%)
  commissionAmount: number; // Сумма комиссии

  // Логистика
  logisticsCost: number; // Стоимость логистики для одной единицы
  totalLogisticsCost: number; // Общая стоимость логистики
  returnLogisticsCost: number; // Стоимость обратной логистики
  warehouseCoefficient: number; // Коэффициент склада

  // Хранение
  storageCostPerDay: number; // Стоимость хранения в день
  totalStorageCost: number; // Общая стоимость хранения

  // Итоговые показатели
  totalCost: number; // Общие затраты
  revenue: number; // Выручка
  profit: number; // Прибыль
  roi: number; // Рентабельность инвестиций (%)
  marginPercent: number; // Маржинальность (%)
}

/**
 * Получить комиссию для категории или подкатегории
 */
export function getCommissionPercent(categoryName: string, subCategoryName?: string, supplyType: SupplyType = 'FBO'): number {
  // Найти категорию
  const category = categories.find(c => 
    c.name.toLowerCase() === categoryName.toLowerCase()
  );
  
  if (!category) {
    return 15; // Значение по умолчанию, если категория не найдена
  }
  
  // Если указана подкатегория, пытаемся найти её
  if (subCategoryName && category.subCategories) {
    const subCategory = category.subCategories.find(sc => 
      sc.name.toLowerCase() === subCategoryName.toLowerCase()
    );
    
    if (subCategory) {
      return supplyType === 'FBO' ? subCategory.commissionFBO : subCategory.commissionFBS;
    }
  }
  
  // Возвращаем комиссию для основной категории
  return supplyType === 'FBO' ? category.commissionFBO : category.commissionFBS;
}

/**
 * Рассчитать стоимость логистики для одной единицы товара
 */
export function calculateLogisticsCost(
  volume: number, 
  supplyType: SupplyType, 
  warehouse: string,
  isOversized: boolean
): number {
  // Получаем коэффициент склада
  const coefficient = warehouseCoefficients[warehouse as keyof typeof warehouseCoefficients] || warehouseCoefficients.default;
  
  // Получаем коэффициент габаритов
  const sizeCoefficient = isOversized ? sizeCoefficients.oversized : sizeCoefficients.standard;
  
  // Рассчитываем базовую стоимость логистики
  let cost = logisticsTariffs.baseFirstLiter;
  
  // Если объем больше 1 литра, добавляем стоимость для дополнительных литров
  if (volume > 1) {
    cost += logisticsTariffs.baseAdditionalLiter * (volume - 1);
  }
  
  // Применяем коэффициент склада
  cost *= coefficient;
  
  // Применяем коэффициент габаритов
  cost *= sizeCoefficient;
  
  // Для FBS применяем специальный множитель
  if (supplyType === 'FBS') {
    cost *= logisticsTariffs.fbsMultiplier;
  }
  
  return cost;
}

/**
 * Рассчитать стоимость хранения
 */
export function calculateStorageCost(
  volume: number, 
  days: number, 
  warehouse: string,
  isPallet: boolean,
  palletCount: number
): number {
  // Получаем коэффициент склада
  const coefficient = warehouseCoefficients[warehouse as keyof typeof warehouseCoefficients] || warehouseCoefficients.default;
  
  let dailyCost = 0;
  
  if (isPallet) {
    // Расчет для паллетного хранения
    dailyCost = storageTariffs.pallet * palletCount * coefficient;
  } else {
    // Расчет для коробочного хранения
    dailyCost = storageTariffs.boxFirstLiter;
    
    // Если объем больше 1 литра, добавляем стоимость для дополнительных литров
    if (volume > 1) {
      dailyCost += storageTariffs.boxAdditionalLiter * (volume - 1);
    }
    
    dailyCost *= coefficient;
  }
  
  // Умножаем на количество дней
  return dailyCost * days;
}

/**
 * Рассчитать стоимость обратной логистики
 */
export function calculateReturnLogisticsCost(supplyType: SupplyType, quantity: number, isOversized: boolean, volume: number): number {
  // В FBO фиксированная стоимость возврата
  if (supplyType === 'FBO') {
    return logisticsTariffs.returnCost * quantity;
  }
  
  // В FBS зависит от габаритов
  if (isOversized) {
    return (120 + 7 * (volume - 1)) * quantity;
  } else {
    return (127.5 + 8.75 * (volume - 1)) * quantity;
  }
}

/**
 * Выполнить полный расчет по всем параметрам
 */
export function calculateAll(params: CalculationParams): CalculationResults {
  // Рассчитываем процент комиссии
  const commissionPercent = getCommissionPercent(
    params.productCategory, 
    params.subCategory, 
    params.supplyType
  );
  
  // Рассчитываем ожидаемое количество проданных товаров
  const soldQuantity = Math.round(params.quantity * (params.selloutPercentage / 100));
  
  // Рассчитываем выручку
  const revenue = soldQuantity * params.sellingPrice;
  
  // Рассчитываем сумму комиссии
  const commissionAmount = revenue * (commissionPercent / 100);
  
  // Рассчитываем стоимость логистики для одной единицы
  const logisticsCost = calculateLogisticsCost(
    params.volume, 
    params.supplyType, 
    params.warehouse,
    params.isOversized
  );
  
  // Общая стоимость логистики для всего количества
  const totalLogisticsCost = logisticsCost * params.quantity;
  
  // Стоимость обратной логистики
  const returnLogisticsCost = calculateReturnLogisticsCost(
    params.supplyType, 
    params.quantity - soldQuantity,
    params.isOversized,
    params.volume
  );
  
  // Получаем коэффициент склада
  const warehouseCoefficient = warehouseCoefficients[params.warehouse as keyof typeof warehouseCoefficients] || warehouseCoefficients.default;
  
  // Стоимость хранения в день
  const storageCostPerDay = calculateStorageCost(
    params.storageVolume, 
    1, 
    params.warehouse,
    params.isPallet,
    params.palletCount
  );
  
  // Общая стоимость хранения
  const totalStorageCost = storageCostPerDay * params.storageDays;
  
  // Общие затраты
  const totalCost = (params.purchasePrice * params.quantity) + totalLogisticsCost + totalStorageCost + returnLogisticsCost;
  
  // Прибыль
  const profit = revenue - commissionAmount - totalCost;
  
  // ROI (Return on Investment)
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  
  // Маржинальность
  const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  return {
    commissionPercent,
    commissionAmount,
    logisticsCost,
    totalLogisticsCost,
    returnLogisticsCost,
    warehouseCoefficient,
    storageCostPerDay,
    totalStorageCost,
    totalCost,
    revenue,
    profit,
    roi,
    marginPercent
  };
} 