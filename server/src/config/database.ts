import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Получаем строку подключения из переменных окружения
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wbsimple';

// Преобразуем SRV-строку в стандартную, если необходимо
const getConnectionString = (uri: string): string => {
  // Если это не SRV-строка или мы в режиме разработки, используем как есть
  if (!uri.includes('mongodb+srv://') || process.env.NODE_ENV === 'development') {
    return uri;
  }

  try {
    // Пытаемся преобразовать SRV-строку в стандартную
    // Пример: mongodb+srv://user:pass@cluster0.xxx.mongodb.net/dbname
    // -> mongodb://user:pass@cluster0-shard-00-00.xxx.mongodb.net:27017,cluster0-shard-00-01.xxx.mongodb.net:27017,cluster0-shard-00-02.xxx.mongodb.net:27017/dbname?ssl=true&replicaSet=atlas-xxx&authSource=admin
    
    // Извлекаем части URI
    const srvMatch = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)(\?.*)?/);
    
    if (!srvMatch) {
      console.log('Не удалось разобрать SRV-строку, используем оригинальную строку');
      return uri;
    }
    
    const [, user, pass, host, dbName, queryParams] = srvMatch;
    const baseHost = host.split('.').slice(1).join('.');
    
    // Создаем стандартную строку подключения
    const standardUri = `mongodb://${user}:${pass}@${host.split('.')[0]}-shard-00-00.${baseHost}:27017,${host.split('.')[0]}-shard-00-01.${baseHost}:27017,${host.split('.')[0]}-shard-00-02.${baseHost}:27017/${dbName}?ssl=true&replicaSet=atlas-cluster&authSource=admin`;
    
    console.log('Преобразованная строка подключения:', standardUri);
    return standardUri;
  } catch (error) {
    console.error('Ошибка преобразования строки подключения:', error);
    return uri;
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    // Получаем оптимальную строку подключения
    const connectionString = getConnectionString(MONGODB_URI);
    
    // Подключаемся к MongoDB
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
      socketTimeoutMS: 45000, // Таймаут сокета
      family: 4, // Использовать IPv4, игнорировать IPv6
    });
    
    console.log('MongoDB подключена успешно');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
}; 