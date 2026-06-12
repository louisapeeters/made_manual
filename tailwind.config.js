/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'made-white': '#FFFFFF',
        'made-neutral-10': '#F3F5F5',
        'made-neutral-15': '#DAE3E3',
        'made-neutral-30': '#A0ABAB',
        'made-neutral-60': '#444F4F',
        'made-neutral-100': '#0F1010',
        'made-purple-75': '#663DF9',
        'made-purple-50': '#7777AA',
      },
      fontFamily: {
        'head': ['Made Sans', 'DM Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'body': ['DM Sans', 'system-ui', 'sans-serif'],
        'serif': ['Piazzolla', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
