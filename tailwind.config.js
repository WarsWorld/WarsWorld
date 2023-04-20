const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: '@',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      sans: ['Proxima Nova', ...defaultTheme.fontFamily.sans],
      colors: {
        primary: '#E47220',
        'primary-variant': '#9EBC9F',
      },
    },
  },
  plugins: [],
};
