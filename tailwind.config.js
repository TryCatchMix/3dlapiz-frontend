/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primaryBg: '#addac0',
        secondaryBg: '#c6dccf',
        primaryWithBg: '#FAFAFA',
        primaryText: '#cba57f',
        secundaryText: '#ccb094',
        primaryHover: '#9fceb3',
        accentText: '#a07a52',     // textos de acento más legibles
        accentSoft: '#f0e6d4',     // fondo suave caramelo
        accentMuted: '#e6d8c4',    // bordes suaves
        ink: '#2a241d',            // texto principal
        inkSoft: '#6e5f4d',        // texto secundario
        pageBg: '#fbf6ec',         // fondo crema
        success: '#7BAE91',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        flyToCart: {
          '0%':   { transform: 'translate(0,0) scale(1) rotate(0)', opacity: '1' },
          '60%':  { transform: 'translate(calc(var(--dx)*.7), calc(var(--dy)*.7 - 80px)) scale(.6) rotate(15deg)', opacity: '.95' },
          '100%': { transform: 'translate(var(--dx), var(--dy)) scale(.15) rotate(40deg)', opacity: '0' },
        },
        pulseDot: {
          '0%,100%': { transform: 'scale(1)', opacity: '1' },
          '50%':     { transform: 'scale(1.6)', opacity: '.5' },
        },
      },
      animation: {
        flyToCart: 'flyToCart .85s cubic-bezier(.55,.05,.55,1) forwards',
        pulseDot: 'pulseDot 1.6s infinite',
      },
    },
  },
  plugins: [],
};
