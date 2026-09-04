/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // Indigo 500
          dark: '#4f46e5', // Indigo 600
          light: '#818cf8', // Indigo 400
        },
        background: {
          light: '#F8FAFC', // Slate 50
          dark: '#0F172A', // Slate 900
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E293B', // Slate 800
        },
        accent: {
          DEFAULT: '#8B5CF6', // Violet 500
        }
      }
    },
  },
  plugins: [],
}

