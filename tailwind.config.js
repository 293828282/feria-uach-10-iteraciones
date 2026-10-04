/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        celeste: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        lila: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        slateGray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
        }
      },
      borderRadius: {
        'squircle-sm': '16px',
        'squircle': '24px',
        'squircle-lg': '32px',
        'squircle-xl': '40px',
      },
      boxShadow: {
        'velvet-sm': '0 4px 20px -4px rgba(56, 189, 248, 0.12), 0 2px 8px -2px rgba(192, 132, 252, 0.08)',
        'velvet': '0 12px 35px -8px rgba(56, 189, 248, 0.18), 0 4px 16px -2px rgba(192, 132, 252, 0.12)',
        'velvet-lg': '0 24px 60px -15px rgba(56, 189, 248, 0.25), 0 8px 24px -4px rgba(192, 132, 252, 0.18)',
        'glass-rim': 'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 1px 0 rgba(186, 230, 253, 0.4)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
