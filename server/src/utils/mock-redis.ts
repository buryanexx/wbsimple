/**
 * Мок-класс для Redis, используемый в режиме разработки
 * когда реальный Redis недоступен
 */
export class MockRedis {
  private storage: Map<string, any>;

  constructor() {
    this.storage = new Map();
    console.log('⚠️ Используется мок-версия Redis для локальной разработки');
  }

  /**
   * Имитация команды SET
   */
  async set(key: string, value: any, expiryMode?: string, time?: number): Promise<'OK'> {
    if (expiryMode === 'EX' && time) {
      // Устанавливаем значение с истечением срока действия
      this.storage.set(key, value);
      
      // Удаляем значение через указанное время (в секундах)
      setTimeout(() => {
        this.storage.delete(key);
      }, time * 1000);
    } else {
      // Просто устанавливаем значение
      this.storage.set(key, value);
    }
    
    return 'OK';
  }

  /**
   * Имитация команды GET
   */
  async get(key: string): Promise<string | null> {
    return this.storage.has(key) ? this.storage.get(key) : null;
  }

  /**
   * Имитация команды DEL
   */
  async del(key: string): Promise<number> {
    const existed = this.storage.has(key);
    this.storage.delete(key);
    return existed ? 1 : 0;
  }

  /**
   * Имитация команды EXISTS
   */
  async exists(key: string): Promise<number> {
    return this.storage.has(key) ? 1 : 0;
  }

  /**
   * Имитация команды EXPIRE
   */
  async expire(key: string, seconds: number): Promise<number> {
    if (!this.storage.has(key)) {
      return 0;
    }

    // Удаляем значение через указанное время
    setTimeout(() => {
      this.storage.delete(key);
    }, seconds * 1000);

    return 1;
  }

  /**
   * Имитация команды PING
   */
  async ping(): Promise<string> {
    return 'PONG';
  }

  /**
   * Имитация команды QUIT
   */
  async quit(): Promise<'OK'> {
    this.storage.clear();
    return 'OK';
  }

  /**
   * Имитация команды KEYS
   */
  async keys(pattern: string): Promise<string[]> {
    // Для простоты возвращаем все ключи
    return Array.from(this.storage.keys());
  }

  /**
   * Имитация команды FLUSHALL
   */
  async flushall(): Promise<'OK'> {
    this.storage.clear();
    return 'OK';
  }

  /**
   * Имитация обработчика событий
   */
  on(event: string, callback: (...args: any[]) => void): this {
    // Ничего не делаем, так как это мок
    return this;
  }
} 