/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050408",
          900: "#0a0810",
          800: "#120f1a",
          700: "#1b1724",
        },
        gold: {
          200: "#f6dd8a",
          300: "#f0d074",
          400: "#e6c15c",
          500: "#d4af37",
          600: "#b8892f",
          700: "#96702a",
        },
        cream: "#f7efdd",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        serif2: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 40px rgba(230, 193, 92, 0.25)",
        glass: "0 20px 60px rgba(0,0,0,0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
