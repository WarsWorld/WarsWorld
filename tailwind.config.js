// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "@",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      sans: ["Proxima Nova", ...defaultTheme.fontFamily.sans],
      colors: {
        primary: "#ff9243",
        "primary-variant": "#b7eab8",
        "bg-primary": "#242A31",
        "bg-secondary": "#293143",
        "bg-tertiary": "#3E4A63",

      },
    },
    screens: {
      tablet: "480px",
      smallscreen: "768px",
      laptop: "1024px",
      short: { raw: "(min-height: 600px)" },
      medium: { raw: "(min-height: 700px)" },
    },
  },
  plugins: [],
};
