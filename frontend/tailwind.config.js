/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4F46E5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: '#22C55E',
        accent: '#F59E0B',
        danger: '#EF4444',
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
          sidebar: '#111827',
        },
        ink: {
          DEFAULT: '#0f172a',
          light: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        '2.5xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(15, 23, 42, 0.08), 0 2px 8px -4px rgba(15, 23, 42, 0.04)',
        lift: '0 20px 40px -12px rgba(79, 70, 229, 0.22), 0 8px 20px -8px rgba(15, 23, 42, 0.12)',
        glow: '0 0 0 1px rgba(79,70,229,.06), 0 8px 40px -8px rgba(79,70,229,.35)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'mesh-gradient':
          'radial-gradient(at 0% 0%, rgba(79,70,229,0.10) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(168,85,247,0.08) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(34,197,94,0.07) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(245,158,11,0.06) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 0% 0%, rgba(79,70,229,0.16) 0px, transparent 45%), radial-gradient(at 100% 0%, rgba(168,85,247,0.10) 0px, transparent 45%), radial-gradient(at 50% 100%, rgba(34,197,94,0.08) 0px, transparent 50%)',
        'brand-gradient': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366F1 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 50%, #eef2ff 100%)',
        'hero-dark': 'linear-gradient(140deg, #111827 0%, #1e1b4b 60%, #0f172a 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmerx: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        gradient: 'gradient 8s ease infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
