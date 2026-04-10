/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        cellar: '0 22px 60px rgba(42, 31, 33, 0.14)',
        subtle: '0 10px 30px rgba(42, 31, 33, 0.08)',
        lift: '0 16px 42px rgba(90, 35, 48, 0.16)',
      },
      colors: {
        ink: '#251F21',
        paper: '#F7F4EF',
        linen: '#ECE6DC',
        porcelain: '#FBFAF7',
        fog: '#E9ECE7',
        vine: '#5A1F31',
        pinot: '#8D2943',
        rosewood: '#B45569',
        moss: '#46624F',
        sage: '#81937F',
        gold: '#B98E45',
        straw: '#E6D3A3',
        clay: '#A5483E',
        smoke: '#72706D',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
};
