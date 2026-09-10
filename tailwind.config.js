/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#F6F7FB',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#EEF0F5',
          muted: '#F1F3F8',
        },
        ink: {
          900: '#14151F',
          700: '#3F4354',
          500: '#6B7086',
          400: '#9AA0B4',
          300: '#C2C6D6',
        },
        brand: {
          DEFAULT: '#111114',
          50: '#F4F4F5',
          100: '#E4E4E7',
          200: '#C7C7CC',
          600: '#000000',
        },
        accent: {
          up: '#1FAE5C',
          upSoft: '#E7F8ED',
          down: '#F0483E',
          downSoft: '#FDEBEA',
        },
        pastel: {
          blue: '#EAF1FF',
          green: '#E9F8EE',
          pink: '#FEECF3',
          yellow: '#FFF6E0',
          purple: '#F2ECFF',
          peach: '#FFEEE5',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.75rem',
        xl3: '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 21, 31, 0.04), 0 8px 24px -12px rgba(20, 21, 31, 0.10)',
        card: '0 2px 6px rgba(20, 21, 31, 0.03), 0 12px 28px -16px rgba(20, 21, 31, 0.12)',
        nav: '0 8px 30px -8px rgba(20, 21, 31, 0.18)',
        sheet: '0 -12px 40px -12px rgba(20, 21, 31, 0.18)',
        glow: '0 8px 20px -6px rgba(17, 17, 20, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.94)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '150% 0' },
          '100%': { backgroundPosition: '-150% 0' },
        },
        'img-in': {
          '0%': { opacity: 0, transform: 'scale(1.02)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pop': 'pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'img-in': 'img-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
