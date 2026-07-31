import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm, trustworthy Beacon palette
        beacon: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Calm teal accent — trust & guidance
        harbor: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        cream: {
          50: '#fdfcfb',
          100: '#f8f5f1',
          200: '#f0eae1',
        },
        ink: {
          DEFAULT: '#1c1917',
          soft: '#44403c',
          muted: '#78716c',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 2px 20px -4px rgba(124, 45, 18, 0.08), 0 4px 8px -4px rgba(124, 45, 18, 0.04)',
        card: '0 4px 24px -6px rgba(124, 45, 18, 0.12), 0 2px 6px -2px rgba(0,0,0,0.04)',
        glow: '0 8px 40px -8px rgba(249, 115, 22, 0.35)',
        float: '0 12px 32px -8px rgba(124, 45, 18, 0.28)',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef3c7 100%)',
        'beacon-gradient': 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)',
        'harbor-gradient': 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
        'dusk-gradient': 'linear-gradient(160deg, #1c1917 0%, #292524 60%, #3f2d1a 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'paw-bounce': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) rotate(-6deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'scale-in': 'scale-in 0.4s ease-out both',
        float: 'float 4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 1.8s infinite',
        'paw-bounce': 'paw-bounce 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
