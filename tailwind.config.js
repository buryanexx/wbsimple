/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7B68EE", // Фиолетовый (Wildberries)
        accent: "#FF914D", // Оранжевый (акцентный)
        background: {
          light: "#FFFFFF",
          dark: "#212121",
        },
        text: {
          light: "#333333",
          dark: "#F5F5F5",
        }
      },
    },
  },
  plugins: [],
} 