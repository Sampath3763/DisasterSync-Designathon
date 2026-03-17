/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        danger: { DEFAULT: '#ef4444', dark: '#b91c1c', light: '#fee2e2' },
        warning: { DEFAULT: '#f59e0b', dark: '#b45309', light: '#fef3c7' },
        success: { DEFAULT: '#22c55e', dark: '#15803d', light: '#dcfce7' },
        info: { DEFAULT: '#3b82f6', dark: '#1d4ed8', light: '#dbeafe' },
        critical: { DEFAULT: '#7c3aed', dark: '#5b21b6', light: '#ede9fe' },
      },
    },
  },
  plugins: [],
};
