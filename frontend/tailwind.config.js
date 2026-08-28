/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981', // Main Renewable Emerald
          600: '#059669',
          900: '#064e3b',
        },
        telemetry: {
          temp: '#f97316', // Orange
          humid: '#06b6d4', // Cyan
          volt: '#3b82f6', // Royal Blue
          curr: '#a855f7', // Purple
          power: '#10b981', // Green
          rpm: '#eab308', // Yellow
        },
        dark: {
          bg: '#0b0f17',
          card: '#111827',
          border: '#1f2937',
          hover: '#1e293b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
};
