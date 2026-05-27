import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        yale: '#0D3B66',
        'yale-light': '#1e6bba',
        lemon: '#FAF0CA',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 2px 20px rgba(13,59,102,0.08)',
        'card-hover': '0 8px 32px rgba(13,59,102,0.14)',
      },
    },
  },
  plugins: [],
}
export default config
