/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#10243A',
          800: '#173B5E',
          700: '#1E4C7A',
          600: '#2A66A0',
          100: '#E4ECF4',
          50: '#F0F5FA',
        },
        emergency: {
          red: '#DC3545',
          'red-dark': '#B02A37',
          'red-light': '#F8D7DA',
        },
        warning: {
          orange: '#F59E0B',
          'orange-dark': '#D97706',
          'orange-light': '#FEF3C7',
        },
        safe: {
          green: '#16A34A',
          'green-dark': '#15803D',
          'green-light': '#DCFCE7',
        },
        surface: {
          bg: '#F4F7FA',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 36, 58, 0.06), 0 1px 2px 0 rgba(16, 36, 58, 0.04)',
        'card-hover': '0 4px 6px -1px rgba(16, 36, 58, 0.1), 0 2px 4px -1px rgba(16, 36, 58, 0.06)',
        'glow-red': '0 0 15px rgba(220, 53, 69, 0.4)',
      }
    },
  },
  plugins: [],
}
