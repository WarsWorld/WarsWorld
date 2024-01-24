// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "@",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      sans: ["Proxima Nova", ...defaultTheme.fontFamily.sans],
      fontFamily: {
        russoOne: ["RussoOne", "sans-serif"],
      },
      colors: {
        primary: "#E47220",
        "primary-dark": "#943E15FF",
        "primary-light": "#ec9d64",
        secondary: "#b7eab8",
        "bg-primary": "#171a1e",
        "bg-secondary": "#1e2b46",
        "bg-tertiary": "#394f75",
        "match-orange": "#C0601B",
        "bg-match-live": "#432929",
        "match-live-dot": "#B40000",
        // Country colors
        "orange-star": "rgb(208, 64, 56)",
        "blue-moon": "rgb(70, 110, 254)",
        "green-earth": "rgb(55, 164, 42)",
        "yellow-comet": "rgb(218, 165, 32)",
        "black-hole": "rgb(12,12,12)",
        // Social Media Colors
        discord: "#7289DA",
        github: "#171515",
      },
      minWidth: {
        20: "5rem",
      },
    },

    screens: {
      cellphone: "360px",
      tablet: "480px",
      large_tablet: "640px",
      smallscreen: "768px",
      laptop: "1024px",
      desktop: "1280px",
      monitor: "1640px",
      large_monitor: "1980px",
      ultra: "3600px",
      short: { raw: "(min-height: 600px)" },
      medium: { raw: "(min-height: 700px)" },
      
    },
  },
  safelist: [
    {
      pattern:
        /(bg|border|text)-(orange-star|blue-moon|green-earth|yellow-comet|black-hole)/,
    },
    {
      pattern: /(bg|border|text)-(github|discord|white|black)/,
    },
  ],
  plugins: [],
};
