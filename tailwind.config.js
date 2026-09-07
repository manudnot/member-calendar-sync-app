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
        dark: {
          bg: '#0f172a',
          card: '#161922',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        timetree: {
          DEFAULT: '#10b981',
          dark: '#059669',
          light: '#e6fcf5',
          border: '#96f2d7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Sarabun', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
