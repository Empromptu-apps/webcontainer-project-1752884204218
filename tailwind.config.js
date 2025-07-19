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
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        physical: '#FF0000',
        etheric: '#FF7F00',
        astral: '#FFFF00',
        mental: '#00FF00',
        causal: '#0000FF',
        buddhic: '#4B0082',
        atmic: '#9400D3',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
