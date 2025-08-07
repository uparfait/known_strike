
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
        primary: '#011627',
        secondary: '#0d2b45',
        tertiary: '#1d3b53',
        'text-primary': '#d6deeb',
        'text-secondary': '#a9bbc8',
        'accent-primary': '#7e57c2',
        'accent-secondary': '#5e35b1',
      }
    },
  },
  plugins: [],
}
