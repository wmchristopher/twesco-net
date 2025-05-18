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
        mallow: "oklch(57% 0.1303 310.17 / <alpha-value>)",
        clover: "oklch(57% 0.1303 159.35 / <alpha-value>)",
        stereum: "oklch(57% 0.1303 38.45 / <alpha-value>)",
        robin: "oklch(57% 0.1303 228.96 / <alpha-value>)",
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
