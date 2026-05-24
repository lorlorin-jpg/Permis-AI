/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 — scan all JS/TS/TSX files in the app
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#6366F1',
          50: '#EEEEFF',
          100: '#E0E0FE',
          200: '#C7C8FD',
          300: '#A5A6FA',
          400: '#8284F7',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        accent: {
          DEFAULT: '#EC4899',
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
          950: '#500724',
        },
        // Semantic
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#78350F',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#7F1D1D',
        },
        // Dark theme backgrounds
        background: {
          DEFAULT: '#0F0F0F',
          card: '#1A1A1A',
          elevated: '#242424',
        },
        surface: {
          DEFAULT: '#1A1A1A',
          elevated: '#242424',
          border: '#2A2A2A',
        },
        // Text
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A',
        },
      },
      fontFamily: {
        sans: ['System'],
        mono: ['Courier'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
