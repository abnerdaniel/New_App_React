/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#EA1D2C', // Vermelho Delivery
          hover: '#C91622',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          background: '#F7F7F7', // Off-white
        },
        text: {
          dark: '#3E3E3E',
          muted: '#717171',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
