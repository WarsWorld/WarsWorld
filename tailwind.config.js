const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: '@',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      sans: ['Proxima Nova', ...defaultTheme.fontFamily.sans],
      colors: {
        primary: '#E47220',
        'primary-variant': '#9EBC9F',
      },
    },
    screens: {
      phone: '320px',
      tablet: '480px',
      smallscreen: '768px',
      laptop: '1024px',
      short: { raw: '(min-height): 600px' },
      medium: { raw: '(min-height: 700px)' },
    },
  },
  plugins: [],
};
