/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // La fuente 'Inter' se importa en index.html, aquí la definimos para usarla con `font-sans`
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-primary': '#1a1a1a',
        'brand-secondary': '#f0f0f0',
        'brand-accent': '#4f46e5',
        'brand-accent-hover': '#4338ca',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in-up': 'slideInUp 0.5s ease-in-out',
        'pop-in': 'popIn 0.3s ease-out',
        'toast-in': 'toastIn 0.5s ease-out forwards',
        'toast-out': 'toastOut 0.5s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        popIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        toastIn: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        toastOut: {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(100%)', opacity: 0 },
        }
      }
    }
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}