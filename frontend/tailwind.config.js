/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          primary: '#2BC0B4',
          secondary: '#1a9e93',
          light: '#e8faf9',
        },
        orange: {
          accent: '#FF8C42',
        },
        bg: '#f8fafb',
        card: '#ffffff',
        text: {
          primary: '#1a1a2e',
          secondary: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
