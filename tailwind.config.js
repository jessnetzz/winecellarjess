/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        cellar: '0 22px 60px rgba(42, 31, 33, 0.13)',
        subtle: '0 10px 30px rgba(42, 31, 33, 0.075)',
        lift: '0 16px 42px rgba(96, 64, 104, 0.14)',
      },
      colors: {
        ink: '#251F21',
        paper: '#F8F2E8',
        linen: '#EFE5D7',
        porcelain: '#FFF9F0',
        fog: '#EDE9DF',
        vine: '#5A1F31',
        pinot: '#7C3455',
        rosewood: '#B45569',
        plum: '#6E4A72',
        lavender: '#B9A2C5',
        moss: '#46624F',
        sage: '#81937F',
        gold: '#B98E45',
        straw: '#E6D3A3',
        clay: '#A5483E',
        smoke: '#72706D',
      },
      fontFamily: {
        liam: ['"Liam Typeface"', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
};
