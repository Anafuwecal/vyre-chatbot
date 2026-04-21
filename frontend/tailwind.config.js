/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vyre-white': '#ffffff',
        'vyre-black': '#000000',
        'vyre-accent': '#43d8b8',
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      height: {
        'screen-dynamic': '100dvh', // Dynamic viewport height
      },
    },
  },
  plugins: [],
}