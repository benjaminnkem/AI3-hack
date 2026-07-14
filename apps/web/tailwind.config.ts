import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0b0d',
        surface: '#121417',
        card: '#16191d',
        border: '#232830',
        accent: { DEFAULT: '#22e59a', soft: '#1a8f66', muted: '#0f3d2c' },
        danger: '#f0603a',
        warn: '#f0c23a',
        muted: '#8a94a3',
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { glow: '0 0 40px -8px rgba(34,229,154,0.35)' },
    },
  },
  plugins: [],
};
export default config;
