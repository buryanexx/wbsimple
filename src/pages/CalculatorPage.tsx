import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebApp } from '@vkruglikov/react-telegram-web-app';
import Card from '../components/Card';
import Button from '../components/Button';

const CalculatorPage = () => {
  const navigate = useNavigate();
  const webApp = useWebApp();
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние для полей калькулятора
  const [productCost, setProductCost] = useState<number>(1000);
  const [sellingPrice, setSellingPrice] = useState<number>(2500);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(100);
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [logisticsCost, setLogisticsCost] = useState<number>(200);
  const [advertisingCost, setAdvertisingCost] = useState<number>(10000);
  
  // Результаты расчетов
  const [grossRevenue, setGrossRevenue] = useState<number>(0);
  const [totalCosts, setTotalCosts] = useState<number>(0);
  const [netProfit, setNetProfit] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(0);
  const [roi, setRoi] = useState<number>(0);

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

  // Расчет прибыли при изменении любого из параметров
  useEffect(() => {
    // Валовая выручка
    const calculatedGrossRevenue = sellingPrice * monthlyVolume;
    
    // Комиссия маркетплейса
    const marketplaceCommission = (sellingPrice * commissionRate / 100) * monthlyVolume;
    
    // Общие затраты на логистику
    const totalLogistics = logisticsCost * monthlyVolume;
    
    // Общие затраты на товар
    const totalProductCost = productCost * monthlyVolume;
    
    // Общие затраты
    const calculatedTotalCosts = totalProductCost + marketplaceCommission + totalLogistics + advertisingCost;
    
    // Чистая прибыль
    const calculatedNetProfit = calculatedGrossRevenue - calculatedTotalCosts;
    
    // Маржа прибыли (%)
    const calculatedProfitMargin = (calculatedNetProfit / calculatedGrossRevenue) * 100;
    
    // ROI (%)
    const calculatedRoi = (calculatedNetProfit / calculatedTotalCosts) * 100;
    
    // Обновляем состояние
    setGrossRevenue(calculatedGrossRevenue);
    setTotalCosts(calculatedTotalCosts);
    setNetProfit(calculatedNetProfit);
    setProfitMargin(calculatedProfitMargin);
    setRoi(calculatedRoi);
  }, [productCost, sellingPrice, monthlyVolume, commissionRate, logisticsCost, advertisingCost]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      maximumFractionDigits: 1
    }).format(value / 100);
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
    <div className="flex flex-col items-center justify-center p-4 space-y-6 pb-44 animate-fade-in">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          leftIcon={<span className="text-lg">←</span>}
          className="mb-4"
        >
          Назад
        </Button>
        
        <h1 className="text-2xl font-bold text-center mb-2 animate-slide-in-right">
          Калькулятор прибыли
        </h1>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 animate-slide-in-right" style={{ animationDelay: '50ms' }}>
          Рассчитайте потенциальную прибыль от продаж на Wildberries
        </p>
        
        {/* Ввод данных */}
        <Card 
          variant="default" 
          className="mb-6 animate-slide-in-right" 
        >
          <div style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-semibold mb-4">Параметры расчета</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Себестоимость товара (₽)
                </label>
                <input
                  type="number"
                  min="1"
                  value={productCost}
                  onChange={(e) => setProductCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Цена продажи (₽)
                </label>
                <input
                  type="number"
                  min="1"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Объем продаж в месяц (шт)
                </label>
                <input
                  type="number"
                  min="1"
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Комиссия Wildberries (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Стоимость логистики за единицу (₽)
                </label>
                <input
                  type="number"
                  min="0"
                  value={logisticsCost}
                  onChange={(e) => setLogisticsCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Расходы на рекламу в месяц (₽)
                </label>
                <input
                  type="number"
                  min="0"
                  value={advertisingCost}
                  onChange={(e) => setAdvertisingCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Результаты расчета */}
        <Card 
          variant="primary" 
          className="mb-6 animate-slide-in-right" 
        >
          <div style={{ animationDelay: '200ms' }}>
            <h2 className="text-lg font-semibold mb-4">Результаты расчета</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Валовая выручка:</span>
                <span className="font-semibold">{formatCurrency(grossRevenue)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Общие затраты:</span>
                <span className="font-semibold">{formatCurrency(totalCosts)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Чистая прибыль:</span>
                <span className={`font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Маржа прибыли:</span>
                <span className={`font-semibold ${profitMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercent(profitMargin)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">ROI:</span>
                <span className={`font-semibold ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercent(roi)}
                </span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Советы по увеличению прибыли */}
        <Card 
          variant="accent" 
          className="animate-slide-in-right" 
        >
          <div style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-semibold mb-2">Как увеличить прибыль?</h2>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Оптимизируйте закупочную цену, найдя более выгодных поставщиков</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Улучшите качество фото и описаний для повышения конверсии</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Работайте над SEO-оптимизацией карточек товаров</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Анализируйте эффективность рекламных кампаний</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Используйте стратегии ценообразования из нашего курса</span>
              </li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Хотите узнать больше стратегий для увеличения прибыли на Wildberries?
              </p>
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => navigate('/subscription')}
              >
                Получить доступ к полному курсу
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalculatorPage; 