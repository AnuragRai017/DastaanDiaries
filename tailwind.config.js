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
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent': 'var(--accent-color)',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        netflix: {
          red: '#e50914',
          black: '#141414',
          dark: '#1f1f1f',
          gray: '#808080',
          lightgray: '#b3b3b3',
          input: '#333333',
          hover: '#f40612',
          success: '#2aca8c',
          warning: '#e87c03',
          info: '#0080ff'
        }
      },
      fontFamily: {
        netflix: ['Netflix Sans', 'Helvetica Neue', 'Segoe UI', 'Roboto', 'Ubuntu', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'netflix': '0 2px 4px rgba(0, 0, 0, 0.2)',
        'netflix-hover': '0 8px 12px rgba(0, 0, 0, 0.4)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
