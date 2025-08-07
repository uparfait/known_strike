
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'itim': ['Itim', 'cursive'],
      },
      colors: {
        dark: {
          100: '#1e1e1e',
          200: '#2d2d30',
          300: '#3e3e42',
          400: '#569cd6',
          500: '#dcdcaa',
        }
      }
    },
  },
  plugins: [],
}
