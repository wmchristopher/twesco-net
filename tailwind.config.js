/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        mallow: "oklch(57% 0.13 315 / <alpha-value>)",
        clover: "oklch(57% 0.13 160 / <alpha-value>)",
        stereum: "oklch(60% 0.15 38 / <alpha-value>)",
        robin: "oklch(67% 0.11 235 / <alpha-value>)",
      },
      fontFamily: {
        ysabeau: ["Ysabeau", "sans-serif"],
        cormorant: ["Cormorant", "serif"],
        montserrat: ["Montserrat Alternates", "sans-serif"]
      }
    },
  },
  safelist: [
    "key-mallow",
    "key-clover",
    "key-stereum",
    "key-robin",
    "key-none",
    "key-active"
  ],
  plugins: [
    require("@tailwindcss/typography")
  ],
}
