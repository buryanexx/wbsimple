import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения
  const env = loadEnv(mode, process.cwd(), '')
  
  // Порт из переменных окружения или 3000 по умолчанию
  const port = parseInt(env.PORT || '3000', 10)
  
  return {
    plugins: [react()],
    base: './', // Относительный путь для лучшей поддержки хеш-роутинга
    server: {
      port,
      strictPort: false, // Если порт занят, попробуем следующий
      host: true, // Чтобы сервер был доступен по сети
      open: false, // Не открывать браузер автоматически
      cors: true, // Включаем CORS
      proxy: {
        // Настройка прокси для API, если потребуется
        '/api': {
          target: env.API_URL || 'https://api.example.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    preview: {
      port: port + 1000, // Preview порт на 4000 по умолчанию (3000 + 1000)
      strictPort: true,
      host: true,
      open: false
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser', // Используем terser для лучшей минификации
      terserOptions: {
        compress: {
          drop_console: false, // Сохраняем консоль для отладки в продакшене
          drop_debugger: false // Сохраняем отладочные точки в продакшене
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            telegram: ['@vkruglikov/react-telegram-web-app']
          }
        }
      },
      // Копируем 404.html для Vercel
      assetsDir: 'assets',
      emptyOutDir: true
    }
  }
})
