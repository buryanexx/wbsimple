import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';

// Структура данных для калькулятора
interface ProfitCalculatorData {
  // Основные параметры товара
  purchasePrice: number;         // Закупочная цена за единицу
  sellingPrice: number;          // Цена продажи на Wildberries
  quantity: number;              // Количество товара в партии
  
  // Комиссии и расходы
  wbCommissionPercent: number;   // Комиссия Wildberries (%)
  logisticsCost: number;         // Стоимость логистики за единицу
  packagingCost: number;         // Стоимость упаковки за единицу
  additionalCosts: number;       // Дополнительные расходы на всю партию
  
  // Налоги
  taxSystemType: 'osn' | 'usn_income' | 'usn_income_minus_expenses' | 'patent'; // Тип налогообложения
  
  // Прогнозы
  selloutPercentage: number;     // Процент выкупа (%)
  selloutPeriod: number;         // Период реализации (дней)
}

// Функция расчета прибыли
const calculateProfit = (data: ProfitCalculatorData) => {
  // Расчет количества проданных единиц
  const soldUnits = Math.round(data.quantity * (data.selloutPercentage / 100));
  
  // Расчет выручки
  const totalRevenue = soldUnits * data.sellingPrice;
  
  // Расчет комиссии Wildberries
  const wbCommission = totalRevenue * (data.wbCommissionPercent / 100);
  
  // Расчет себестоимости
  const costPrice = data.purchasePrice * data.quantity;
  
  // Расчет логистики и упаковки
  const logistics = data.logisticsCost * data.quantity;
  const packaging = data.packagingCost * data.quantity;
  
  // Расчет общих расходов
  const totalExpenses = costPrice + logistics + packaging + data.additionalCosts;
  
  // Расчет валовой прибыли
  const grossProfit = totalRevenue - wbCommission - totalExpenses;
  
  // Расчет налогов в зависимости от системы налогообложения
  let tax = 0;
  switch (data.taxSystemType) {
    case 'osn':
      tax = grossProfit > 0 ? grossProfit * 0.2 : 0; // НДС 20%
      break;
    case 'usn_income':
      tax = totalRevenue * 0.06; // УСН 6% от дохода
      break;
    case 'usn_income_minus_expenses':
      tax = grossProfit > 0 ? grossProfit * 0.15 : 0; // УСН 15% от прибыли
      break;
    case 'patent':
      // Для патента налог фиксированный, но зависит от региона и вида деятельности
      tax = 0;
      break;
  }
  
  // Расчет чистой прибыли
  const netProfit = grossProfit - tax;
  
  // Расчет ROI (Return on Investment)
  const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
  
  // Расчет маржинальности
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  // Расчет прибыли на единицу товара
  const profitPerUnit = soldUnits > 0 ? netProfit / soldUnits : 0;
  
  // Расчет точки безубыточности (сколько нужно продать, чтобы выйти в ноль)
  const breakEvenUnits = Math.ceil(
    totalExpenses / (data.sellingPrice - (data.sellingPrice * (data.wbCommissionPercent / 100)))
  );
  
  // Расчет срока окупаемости (в днях)
  const returnOnInvestmentDays = 
    soldUnits > 0 ? 
    Math.ceil((breakEvenUnits / soldUnits) * data.selloutPeriod) : 
    Infinity;
  
  return {
    // Основные показатели
    totalRevenue,
    wbCommission,
    totalExpenses,
    grossProfit,
    tax,
    netProfit,
    
    // Аналитические показатели
    roi,
    margin,
    profitPerUnit,
    breakEvenUnits,
    returnOnInvestmentDays,
    
    // Прогнозы
    soldUnits,
    unsoldUnits: data.quantity - soldUnits
  };
};

const CalculatorPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние для хранения данных калькулятора
  const [calculatorData, setCalculatorData] = useState<ProfitCalculatorData>({
    purchasePrice: 500,
    sellingPrice: 1500,
    quantity: 100,
    wbCommissionPercent: 15,
    logisticsCost: 50,
    packagingCost: 20,
    additionalCosts: 5000,
    taxSystemType: 'usn_income_minus_expenses',
    selloutPercentage: 80,
    selloutPeriod: 30
  });
  
  // Состояние для хранения результатов расчета
  const [results, setResults] = useState<ReturnType<typeof calculateProfit> | null>(null);
  
  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Настраиваем кнопку Telegram
    if (webApp?.MainButton && !isLoading) {
      webApp.MainButton.setText('Подписаться и начать зарабатывать');
      webApp.MainButton.show();
      webApp.MainButton.onClick(() => navigate('/subscription'));
    }
    
    return () => {
      // Скрываем кнопку при размонтировании компонента
      webApp?.MainButton?.hide();
    };
  }, [webApp, isLoading, navigate]);

  // Обработчик изменения полей ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCalculatorData(prev => ({
      ...prev,
      [name]: name === 'taxSystemType' ? value : Number(value)
    }));
  };
  
  // Функция расчета прибыли
  const handleCalculate = () => {
    const result = calculateProfit(calculatorData);
    setResults(result);
  };

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
      <h1 className="text-2xl font-bold mb-6">Калькулятор прибыли на Wildberries</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Параметры расчета</h2>
        
        <div className="space-y-4">
          {/* Основные параметры товара */}
          <div>
            <h3 className="font-medium mb-2">Информация о товаре</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Закупочная цена (₽)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={calculatorData.purchasePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Цена продажи (₽)</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={calculatorData.sellingPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Количество товара (шт)</label>
                <input
                  type="number"
                  name="quantity"
                  value={calculatorData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
          
          {/* Комиссии и расходы */}
          <div>
            <h3 className="font-medium mb-2">Комиссии и расходы</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Комиссия Wildberries (%)</label>
                <input
                  type="number"
                  name="wbCommissionPercent"
                  value={calculatorData.wbCommissionPercent}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Стоимость логистики (₽/шт)</label>
                <input
                  type="number"
                  name="logisticsCost"
                  value={calculatorData.logisticsCost}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Стоимость упаковки (₽/шт)</label>
                <input
                  type="number"
                  name="packagingCost"
                  value={calculatorData.packagingCost}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Дополнительные расходы (₽)</label>
                <input
                  type="number"
                  name="additionalCosts"
                  value={calculatorData.additionalCosts}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
          
          {/* Налоги */}
          <div>
            <h3 className="font-medium mb-2">Налогообложение</h3>
            <div>
              <label className="block text-sm mb-1">Система налогообложения</label>
              <select
                name="taxSystemType"
                value={calculatorData.taxSystemType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="osn">ОСН (НДС 20%)</option>
                <option value="usn_income">УСН Доходы (6%)</option>
                <option value="usn_income_minus_expenses">УСН Доходы-Расходы (15%)</option>
                <option value="patent">Патент</option>
              </select>
            </div>
          </div>
          
          {/* Прогнозы */}
          <div>
            <h3 className="font-medium mb-2">Прогнозы продаж</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Процент выкупа (%)</label>
                <input
                  type="number"
                  name="selloutPercentage"
                  value={calculatorData.selloutPercentage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Период реализации (дней)</label>
                <input
                  type="number"
                  name="selloutPeriod"
                  value={calculatorData.selloutPeriod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCalculate}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium"
          >
            Рассчитать прибыль
          </button>
        </div>
      </div>
      
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Результаты расчета</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Выручка</p>
                <p className="text-lg font-semibold">{results.totalRevenue.toLocaleString()} ₽</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Комиссия WB</p>
                <p className="text-lg font-semibold">{results.wbCommission.toLocaleString()} ₽</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Общие расходы</p>
                <p className="text-lg font-semibold">{results.totalExpenses.toLocaleString()} ₽</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Налоги</p>
                <p className="text-lg font-semibold">{results.tax.toLocaleString()} ₽</p>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-lg col-span-1 sm:col-span-2">
                <p className="text-sm text-primary">Чистая прибыль</p>
                <p className="text-xl font-bold text-primary">{results.netProfit.toLocaleString()} ₽</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Аналитические показатели</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">ROI (окупаемость инвестиций)</p>
                  <p className="text-lg font-semibold">{results.roi.toFixed(2)}%</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Маржинальность</p>
                  <p className="text-lg font-semibold">{results.margin.toFixed(2)}%</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Прибыль на единицу товара</p>
                  <p className="text-lg font-semibold">{results.profitPerUnit.toFixed(2)} ₽</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Точка безубыточности</p>
                  <p className="text-lg font-semibold">{results.breakEvenUnits} шт.</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Прогноз продаж</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Прогноз проданных единиц</p>
                  <p className="text-lg font-semibold">{results.soldUnits} шт.</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Прогноз остатков</p>
                  <p className="text-lg font-semibold">{results.unsoldUnits} шт.</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg col-span-1 sm:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Срок окупаемости</p>
                  <p className="text-lg font-semibold">
                    {results.returnOnInvestmentDays === Infinity 
                      ? 'Не окупится при текущих параметрах' 
                      : `${results.returnOnInvestmentDays} дней`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorPage; 