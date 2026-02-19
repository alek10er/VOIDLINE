import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          bg: '#000000',
          secondary: '#0B0B0F',
          panel: '#141418',
          hover: '#1C1C22',
          text: '#FFFFFF',
          muted: '#A1A1AA',
          success: '#00FF66',
          incoming: '#7C3AED',
          danger: '#FF2D55',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
