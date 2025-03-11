declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
      NODE_ENV: 'development' | 'production';
      TELEGRAM_BOT_TOKEN: string;
      TELEGRAM_PAYMENT_TOKEN: string;
      GhjWEBAPP_URL: string;
    }
  }
}

export {}; 