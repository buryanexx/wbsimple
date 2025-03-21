/**
 * Данные от Telegram для аутентификации
 */
export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * JWT Payload для токена
 */
export interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Данные пользователя
 */
export interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  role: string;
}

/**
 * Запрос на обновление токена
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Ответ с токенами 
 */
export interface TokenResponse {
  token: string;
  refreshToken?: string;
  user: UserData;
}