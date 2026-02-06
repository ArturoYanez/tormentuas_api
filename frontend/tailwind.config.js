/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8b5cf6',
        secondary: '#64748b',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        dark: {
          100: '#1e1b2e',
          200: '#13111c',
          300: '#0d0b14',
          400: '#08070c'
        }
      }
    },
  },
  plugins: [],
}
