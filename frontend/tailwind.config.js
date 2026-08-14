/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-gray': '#8686b2',
        'apple-white': '#f5f5f7',
        'apple-dark': '#1d1d1f',
        'apple-accent': '#d15a20',
        'apple-accent-light': '#e87b46',
        'soft-bg': '#fcfcfc',
        'soft-border': 'rgba(0,0,0,0.05)',
      },
      fontFamily: {
        'sans': ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
