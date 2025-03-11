/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7B68EE", // Фиолетовый (Wildberries)
          light: "#9D8FF2",
          dark: "#5A48C0",
          50: "#F4F2FE",
          100: "#E9E5FD",
          200: "#D3CBFB",
          300: "#BDB1F9",
          400: "#A797F7",
          500: "#7B68EE", // Основной
          600: "#6A58D9",
          700: "#5A48C0",
          800: "#4A3AA7",
          900: "#3A2C8E"
        },
        accent: {
          DEFAULT: "#FF914D", // Оранжевый (акцентный)
          light: "#FFAB77",
          dark: "#E67A38",
          50: "#FFF5EE",
          100: "#FFEADD",
          200: "#FFD5BB",
          300: "#FFC099",
          400: "#FFAB77",
          500: "#FF914D", // Основной
          600: "#E67A38",
          700: "#CC6423",
          800: "#B34E0E",
          900: "#993800"
        },
        background: {
          light: "#FFFFFF",
          dark: "#212121",
        },
        text: {
          light: "#333333",
          dark: "#F5F5F5",
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
} 