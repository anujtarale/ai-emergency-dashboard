/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emergency: {
          red: '#EF4444',
          orange: '#F97316',
          yellow: '#EAB308',
          green: '#22C55E',
        }
      }
    },
  },
  plugins: [],
}
