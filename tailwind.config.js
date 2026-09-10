/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens: each resolves to an "R G B" CSS variable (see
        // index.css :root / html.dark) via Tailwind's alpha-value pattern,
        // so bg-base-bg, text-ink-900, bg-base-bg/50 etc. all flip
        // automatically when the `dark` class toggles on <html>.
        base: {
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
          card: 'rgb(var(--color-surface) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          muted: 'rgb(var(--color-muted) / <alpha-value>)',
        },
        ink: {
          900: 'rgb(var(--color-ink-900) / <alpha-value>)',
          700: 'rgb(var(--color-ink-700) / <alpha-value>)',
          500: 'rgb(var(--color-ink-500) / <alpha-value>)',
          400: 'rgb(var(--color-ink-400) / <alpha-value>)',
          300: 'rgb(var(--color-ink-300) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          600: 'rgb(var(--color-brand-600) / <alpha-value>)',
        },
        accent: {
          up: '#1FAE5C',
          upSoft: '#E7F8ED',
          down: '#F0483E',
          downSoft: '#FDEBEA',
        },
        // Small colorful accent chips (category tags, balance pill) stay a
        // constant light tint in both themes — always paired with a fixed
        // dark text color, never the theme-flipping ink/brand tokens.
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
