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
        tyre: "#7A004B",
        parchment: "#FCECC9",
        papyrus: "#F8FEEC",
        slate: "#736B60",
        sierra: "#F96900",
        turquoise: "#4AE5E8"
      },
    },
  },
  safelist: [
    "key-white",
    "key-black",
    "key-none",
    "key-active"
  ],
  plugins: [],
}
