const { DESIGN_TOKENS } = require('../shared/dist/design-tokens.cjs');

// Fallback if compiled tokens are not present yet
const colors =
  DESIGN_TOKENS?.colors ?? {
    darkTeal: { light: '#29c8d6', dark: '#061c1e' },
    pineBlue: { light: '#4db3a8', dark: '#0b1918' },
    mutedTeal: { light: '#609f75', dark: '#0d1610' },
    evergreen: { light: '#08f774', dark: '#012310' },
    onyx: { light: '#0bf417', dark: '#022203' },
  };

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'dark-teal': {
          DEFAULT: colors.darkTeal.light,
          900: colors.darkTeal.dark,
        },
        'pine-blue': {
          DEFAULT: colors.pineBlue.light,
          900: colors.pineBlue.dark,
        },
        'muted-teal': {
          DEFAULT: colors.mutedTeal.light,
          900: colors.mutedTeal.dark,
        },
        evergreen: {
          DEFAULT: colors.evergreen.light,
          900: colors.evergreen.dark,
        },
        onyx: {
          DEFAULT: colors.onyx.light,
          900: colors.onyx.dark,
        },
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(0,0,0,0.25)',
      },
      backgroundImage: {
        'islamic-radial':
          'radial-gradient(circle at 0% 0%, rgba(41,200,214,0.28), transparent 55%), radial-gradient(circle at 100% 0%, rgba(8,247,116,0.2), transparent 55%), radial-gradient(circle at 0% 100%, rgba(11,244,23,0.12), transparent 55%)',
        'islamic-linear':
          'linear-gradient(135deg, #061c1e 0%, #0b1918 50%, #012310 100%)',
      },
      keyframes: {
        'float-soft': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'glow-ring': {
          '0%,100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.08)' },
        },
      },
      animation: {
        'float-soft': 'float-soft 6s ease-in-out infinite',
        'glow-ring': 'glow-ring 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};


