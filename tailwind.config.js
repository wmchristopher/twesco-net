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
        mallow: "#8F5FB0",
        spicebush: "#C3EB78",
        periwinkle: "#78C3EB",
      },
      fontFamily: {
        ysabeau: ["Ysabeau", "sans-serif"],
        cormorant: ["Cormorant", "serif"],
        montserrat: ["Montserrat Alternates", "sans-serif"]
      }
    },
  },
  safelist: [
    "key-white",
    "key-black",
    "key-none",
    "key-active"
  ],
  plugins: [
    require("@tailwindcss/typography")
  ],
}
