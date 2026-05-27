import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        yale:  { DEFAULT: '#0D3B66', 50: '#e8f0f8', 100: '#c5d8ed', 200: '#8ab2db', 300: '#4f8bc9', 400: '#2a6aad', 500: '#0D3B66', 600: '#0a2f52', 700: '#07223d', 800: '#041628', 900: '#020b14' },
        lemon: { DEFAULT: '#FAF0CA', 50: '#fffef5', 100: '#fdf8e3', 200: '#faf0ca', 300: '#f5e49f', 400: '#f0d674', 500: '#e8c43a' },
        cream: '#FEFCF3',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card':     '0 2px 16px 0 rgba(13,59,102,0.07)',
        'card-md':  '0 4px 32px 0 rgba(13,59,102,0.10)',
        'card-lg':  '0 8px 48px 0 rgba(13,59,102,0.14)',
        'glow':     '0 0 0 3px rgba(13,59,102,0.15)',
        'glow-sm':  '0 0 0 2px rgba(13,59,102,0.10)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pop':     { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.06)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out',
        'pop':     'pop 0.4s ease-in-out',
        shimmer:   'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
