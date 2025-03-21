import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

// Тип для полезной нагрузки токена
export interface TokenPayload {
  userId: string;
  telegramId: string;
  role: string;
}

// Тип для токенов
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Утилита для работы с JWT-токенами
 */
class JwtUtils {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpires: string;
  private readonly refreshExpires: string;

  constructor() {
    this.accessSecret = process.env.JWT_SECRET || 'default_secret_key_not_secure';
    // Для refresh токена используем другой секрет
    this.refreshSecret = `${this.accessSecret}_refresh`;
    this.accessExpires = process.env.JWT_EXPIRES_IN || '1d';
    this.refreshExpires = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    if (this.accessSecret === 'default_secret_key_not_secure') {
      console.warn('⚠️ JWT_SECRET не задан. Используется небезопасный ключ по умолчанию.');
    }
  }

  /**
   * Генерирует пару JWT-токенов (access и refresh)
   * @param payload Полезная нагрузка для токена
   * @returns Пара токенов
   */
  generateTokens(payload: TokenPayload): Tokens {
    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpires,
    });

    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpires,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Проверяет access токен
   * @param token JWT-токен для проверки
   * @returns Расшифрованные данные токена или null в случае ошибки
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.accessSecret) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Проверяет refresh токен
   * @param token Refresh токен для проверки
   * @returns Расшифрованные данные токена или null в случае ошибки
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.refreshSecret) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}

// Экспорт экземпляра утилиты
export const jwtUtils = new JwtUtils(); 