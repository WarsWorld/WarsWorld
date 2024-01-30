// apparently a typescript version of this file is possible, but it broke tailwind in next.js
// when i tried. there's also very little info about "postcss.config.ts" in general.
// so .cjs it is for now :/

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
