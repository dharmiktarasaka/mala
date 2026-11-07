/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050505',
          900: '#080808',
          850: '#0E0E12',
          800: '#14141A',
          750: '#1A1A22',
          700: '#22222D',
        },
        red: {
          brand: '#D71935',
          glow: '#FF2A4D',
          deep: '#9E0D22',
          subtle: '#2A0E13',
        },
        blue: {
          electric: '#315BFF',
          glow: '#587BFF',
          deep: '#152A80',
          ambient: '#0B143A',
        },
        gold: {
          leaf: '#D4AF37',
          champagne: '#F3E5AB',
          antique: '#AA820A',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-glow': '0 0 25px rgba(215, 25, 53, 0.25), 0 0 45px rgba(49, 91, 255, 0.15)',
        'red-glow': '0 0 25px rgba(215, 25, 53, 0.4)',
        'blue-glow': '0 0 30px rgba(49, 91, 255, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

