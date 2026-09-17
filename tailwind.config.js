/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // System-admin brand palette (slate/indigo)
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          base:    '#0f172a', // page bg  (slate-950)
          raised:  '#1e293b', // card bg  (slate-800)
          overlay: '#334155', // modal/hover (slate-700)
          border:  '#334155', // default border
          muted:   '#475569', // muted text / secondary border
        },
        ink: {
          DEFAULT: '#f1f5f9', // primary text  (slate-100)
          muted:   '#94a3b8', // secondary text (slate-400)
          faint:   '#64748b', // disabled / placeholder (slate-500)
        },
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          danger:  '#ef4444',
          info:    '#6366f1',
        },
      },
      keyframes: {
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(1rem)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(0.5rem)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'slide-in':  'slide-in 0.2s ease-out',
        'fade-in':   'fade-in 0.2s ease-out',
        'scale-in':  'scale-in 0.15s ease-out',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow-brand': '0 0 24px -4px rgb(99 102 241 / 0.4)',
        'glow-success': '0 0 24px -4px rgb(34 197 94 / 0.3)',
      },
    },
  },
  plugins: [],
}
