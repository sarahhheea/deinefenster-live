/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./produkte/**/*.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#225eaa",
        "primary-container": "#76a9fa",
        "primary-fixed": "#d6e3ff",
        "on-surface-variant": "rgba(232,238,255,0.75)",
        "outline-variant": "rgba(255,255,255,0.12)",
        "surface": "#0a1530",
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
}
