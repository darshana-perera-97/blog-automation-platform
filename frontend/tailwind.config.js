/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 35px rgba(15, 23, 42, 0.07)",
      },
    },
  },
  plugins: [],
}

