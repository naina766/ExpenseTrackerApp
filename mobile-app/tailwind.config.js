/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./context/**/*.{js,jsx,ts,tsx}", "./navigation/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#38bdf8',
          dark: '#60a5fa',
        },
        secondary: {
          DEFAULT: '#0f172a',
          dark: '#1e293b',
        },
        accent: '#f97316',
        background: {
          DEFAULT: '#0f172a',
          dark: '#0f172a',
        },
        surface: {
          DEFAULT: '#111827',
          dark: '#334155',
        },
        text: {
          DEFAULT: '#ffffff',
          dark: '#f1f5f9',
        },
        textSecondary: {
          DEFAULT: '#94a3b8',
          dark: '#cbd5e1',
        },
        error: '#f87171',
      },
    },
  },
  plugins: [],
}
