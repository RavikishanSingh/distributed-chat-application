/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chat: {
          bg: '#0B0F19',
          card: '#131B2E',
          hover: '#1E293B',
          accent: '#6366F1',
          accentHover: '#4F46E5',
          border: '#1E293B',
          text: '#F8FAFC',
          muted: '#94A3B8',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
