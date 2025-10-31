/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom blue color palette for dark theme
        navy: {
          50: '#e6f0ff',
          100: '#b3d4ff',
          200: '#80b8ff',
          300: '#4d9cff',
          400: '#1a80ff',
          500: '#0066e6',
          600: '#0052b3',
          700: '#003d80',
          800: '#00294d',
          900: '#001a33',
          950: '#000d1a',
        },
        royal: {
          50: '#e8eeff',
          100: '#c2d4ff',
          200: '#9cb9ff',
          300: '#769fff',
          400: '#5084ff',
          500: '#2a6aff',
          600: '#0052e6',
          700: '#003fb3',
          800: '#002c80',
          900: '#001a4d',
        },
        sky: {
          50: '#e6f7ff',
          100: '#b3e5ff',
          200: '#80d4ff',
          300: '#4dc2ff',
          400: '#1ab1ff',
          500: '#009fe6',
          600: '#007db3',
          700: '#005c80',
          800: '#003a4d',
          900: '#00232e',
        },
      },
      backgroundColor: {
        'dark-primary': '#0a0e1a',
        'dark-secondary': '#121829',
        'dark-tertiary': '#1a2137',
        'dark-card': '#1e2742',
      },
      borderColor: {
        'dark-border': '#2a3655',
      },
    },
  },
  plugins: [],
}
