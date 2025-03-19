import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

import { 
  calculateAll, 
  CalculationParams, 
  CalculationResults, 
  SupplyType
} from '../utils/wb-calculator';
import { categories, warehouseCoefficients } from '../data/wb-commissions';

// Состояние калькулятора
interface CalculatorState extends CalculationParams {
  // Дополнительные поля для UI
  selectedCategory: string;
  selectedSubCategory: string | null;
}

const initialState: CalculatorState = {
  // UI поля
  selectedCategory: "Одежда и аксессуары",
  selectedSubCategory: null,
  
  // Базовые параметры расчета
  productCategory: "Одежда и аксессуары",
  volume: 1,
  supplyType: 'FBO',
  warehouse: 'default',
  isOversized: false,
  
  // Параметры хранения
  storageVolume: 1,
  storageDays: 30,
  isPallet: false,
  palletCount: 1,
  
  // Параметры для расчета прибыли
  purchasePrice: 500,
  sellingPrice: 1500,
  quantity: 100,
  selloutPercentage: 80
};

const WildberriesCalculatorPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние калькулятора
  const [calculatorState, setCalculatorState] = useState<CalculatorState>(initialState);
  
  // Результаты расчета
  const [results, setResults] = useState<CalculationResults | null>(null);
  
  // Список доступных подкатегорий
  const [availableSubCategories, setAvailableSubCategories] = useState<{name: string}[]>([]);
  
  // Загрузка начальных данных
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Начальные подкатегории
      const category = categories.find(c => c.name === initialState.selectedCategory);
      if (category && category.subCategories) {
        setAvailableSubCategories(category.subCategories);
      }
      
      // Выполняем начальный расчет
      handleCalculate();
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Обновляем состояние
    setCalculatorState(prev => {
      const newState = {
        ...prev,
        [name]: 
          // Преобразуем значение в зависимости от типа
          name === 'supplyType' ? value as SupplyType :
          name === 'selectedCategory' || name === 'selectedSubCategory' || name === 'warehouse' ? value :
          name === 'isPallet' || name === 'isOversized' ? value === 'true' :
          parseFloat(value) || 0
      };
      
      // Если изменилась категория, обновляем подкатегории
      if (name === 'selectedCategory') {
        const category = categories.find(c => c.name === value);
        
        if (category && category.subCategories) {
          setAvailableSubCategories(category.subCategories);
          
          // Сбрасываем выбранную подкатегорию
          newState.selectedSubCategory = null;
          newState.productCategory = value;
          newState.subCategory = undefined;
        }
      }
      
      // Если изменилась подкатегория
      if (name === 'selectedSubCategory') {
        newState.subCategory = value !== 'null' ? value : undefined;
      }
      
      return newState;
    });
  };
  
  // Функция расчета
  const handleCalculate = () => {
    const result = calculateAll(calculatorState);
    setResults(result);
  };

  // Загрузка
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка калькулятора...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-44">
      <h1 className="text-2xl font-bold mb-6">Калькулятор комиссий и расходов Wildberries</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Параметры расчета</h2>
        
        <div className="space-y-6">
          {/* Тип поставки */}
          <div>
            <h3 className="font-medium mb-2">Схема работы с Wildberries</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Тип поставки</label>
                <select
                  name="supplyType"
                  value={calculatorState.supplyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="FBO">FBO (хранение на складе WB)</option>
                  <option value="FBS">FBS (хранение на вашем складе)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Склад Wildberries</label>
                <select
                  name="warehouse"
                  value={calculatorState.warehouse}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="default">Стандартный (коэф. 1.0)</option>
                  <option value="korolev">Королев (коэф. 1.2)</option>
                  <option value="podolsk">Подольск (коэф. 1.1)</option>
                  <option value="elektrostal">Электросталь (коэф. 1.15)</option>
                  <option value="novosibirsk">Новосибирск (коэф. 1.3)</option>
                  <option value="krasnodar">Краснодар (коэф. 1.25)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Категория товара */}
          <div>
            <h3 className="font-medium mb-2">Категория товара</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Категория</label>
                <select
                  name="selectedCategory"
                  value={calculatorState.selectedCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({
                        calculatorState.supplyType === 'FBO' 
                          ? category.commissionFBO 
                          : category.commissionFBS
                      }%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Подкатегория (если есть)</label>
                <select
                  name="selectedSubCategory"
                  value={calculatorState.selectedSubCategory || 'null'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="null">Не выбрана</option>
                  {availableSubCategories.map((subCategory) => (
                    <option key={subCategory.name} value={subCategory.name}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Параметры товара */}
          <div>
            <h3 className="font-medium mb-2">Параметры товара</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Объем единицы товара (литры)</label>
                <input
                  type="number"
                  name="volume"
                  value={calculatorState.volume}
                  onChange={handleInputChange}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Крупногабаритный товар</label>
                <select
                  name="isOversized"
                  value={calculatorState.isOversized.toString()}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="false">Нет</option>
                  <option value="true">Да</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Хранение (только для FBO) */}
          {calculatorState.supplyType === 'FBO' && (
            <div>
              <h3 className="font-medium mb-2">Параметры хранения</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm mb-1">Тип хранения</label>
                  <select
                    name="isPallet"
                    value={calculatorState.isPallet.toString()}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="false">Коробочное</option>
                    <option value="true">Паллетное</option>
                  </select>
                </div>
                
                {calculatorState.isPallet ? (
                  <div>
                    <label className="block text-sm mb-1">Количество паллет</label>
                    <input
                      type="number"
                      name="palletCount"
                      value={calculatorState.palletCount}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm mb-1">Объем хранения (литры)</label>
                    <input
                      type="number"
                      name="storageVolume"
                      value={calculatorState.storageVolume}
                      onChange={handleInputChange}
                      min="0.1"
                      step="0.1"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm mb-1">Срок хранения (дней)</label>
                  <input
                    type="number"
                    name="storageDays"
                    value={calculatorState.storageDays}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Параметры прибыли */}
          <div>
            <h3 className="font-medium mb-2">Параметры прибыли</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Закупочная цена (₽)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={calculatorState.purchasePrice}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Цена продажи (₽)</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={calculatorState.sellingPrice}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Количество товара (шт)</label>
                <input
                  type="number"
                  name="quantity"
                  value={calculatorState.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Процент выкупа (%)</label>
                <input
                  type="number"
                  name="selloutPercentage"
                  value={calculatorState.selloutPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCalculate}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium"
          >
            Рассчитать
          </button>
        </div>
      </div>
      
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Результаты расчета</h2>
          
          <div className="space-y-6">
            {/* Комиссии */}
            <div>
              <h3 className="font-medium mb-2">Комиссии Wildberries</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Комиссия Wildberries</p>
                  <p className="text-lg font-semibold">{results.commissionPercent.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Сумма комиссии</p>
                  <p className="text-lg font-semibold">{results.commissionAmount.toLocaleString()} ₽</p>
                </div>
              </div>
            </div>
            
            {/* Логистика */}
            <div>
              <h3 className="font-medium mb-2">Логистика</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Стоимость логистики (за единицу)</p>
                  <p className="text-lg font-semibold">{results.logisticsCost.toFixed(2)} ₽</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Общая стоимость логистики</p>
                  <p className="text-lg font-semibold">{results.totalLogisticsCost.toLocaleString()} ₽</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Стоимость обратной логистики</p>
                  <p className="text-lg font-semibold">{results.returnLogisticsCost.toLocaleString()} ₽</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Коэффициент склада</p>
                  <p className="text-lg font-semibold">{results.warehouseCoefficient.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {/* Хранение (только для FBO) */}
            {calculatorState.supplyType === 'FBO' && (
              <div>
                <h3 className="font-medium mb-2">Хранение</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Стоимость хранения (в день)</p>
                    <p className="text-lg font-semibold">{results.storageCostPerDay.toFixed(2)} ₽</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Общая стоимость хранения</p>
                    <p className="text-lg font-semibold">{results.totalStorageCost.toLocaleString()} ₽</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Итоговые показатели */}
            <div>
              <h3 className="font-medium mb-2">Итоговые показатели</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Выручка</p>
                  <p className="text-lg font-semibold">{results.revenue.toLocaleString()} ₽</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Общие затраты</p>
                  <p className="text-lg font-semibold">{results.totalCost.toLocaleString()} ₽</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">ROI</p>
                  <p className="text-lg font-semibold">{results.roi.toFixed(2)}%</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Маржинальность</p>
                  <p className="text-lg font-semibold">{results.marginPercent.toFixed(2)}%</p>
                </div>
                <div className="p-3 bg-primary bg-opacity-10 rounded-lg col-span-1 sm:col-span-2">
                  <p className="text-sm text-primary">Чистая прибыль</p>
                  <p className="text-xl font-bold text-primary">{results.profit.toLocaleString()} ₽</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WildberriesCalculatorPage; 