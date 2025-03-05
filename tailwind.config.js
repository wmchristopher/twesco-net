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
        slate: "#736B60",
        sierra: "#F96900",
        turquoise: "#4AE5E8"
      },
    },
  },
  plugins: [],
}
