/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html, ts}"],
  theme: {
    extend: {
      colors: {
        primaryBg: '#addac0',     // Fondos
        secondaryBg: '#c6dccf',     // Fondos
        primaryWithBg: '#FAFAFA', // Fondos con color blanco
        primaryText: '#cba57f',   // Textos
        secundaryText: '#ccb094',
        primaryHover: '#9fceb3',  // Hover botones
      },
    },
  },
  plugins: [],
}
