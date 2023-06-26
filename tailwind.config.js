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
        primary: "#E47220",
        "primary-dark": "#943E15FF",
        secondary: "#b7eab8",
        "bg-primary": "#242A31",
        "bg-secondary": "#293143",
        "bg-tertiary": "#3E4963",
        "match-orange": "#C0601B",
        "bg-match-live": "#432929",
        "match-live-dot": "#B40000",
        "orange-star": "rgb(208, 64, 56)",
        "blue-moon": "rgb(70, 110, 254)",
        "green-earth": "rgb(55, 164, 42)",
        "yellow-comet": "rgb(218, 165, 32)",
      },
      minWidth: {
        20: "5rem",
      },
    },
    screens: {
      tablet: "480px",
      smallscreen: "768px",
      laptop: "1024px",
      monitor: "1518px",
      large_monitor: "1980px",
      short: { raw: "(min-height: 600px)" },
      medium: { raw: "(min-height: 700px)" },
    },
  },
  plugins: [],
};
