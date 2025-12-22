export const colors = {
  // Dark teal palette
  darkTeal: {
    50: '#eaf9fb',
    100: '#d4f4f7',
    200: '#a9e9ef',
    300: '#7edee7',
    400: '#54d3de',
    500: '#29c8d6',
    600: '#21a0ab',
    700: '#187881',
    800: '#105056',
    900: '#08282b',
    950: '#061c1e',
  },
  // Pine blue palette
  pineBlue: {
    50: '#edf7f6',
    100: '#dbf0ee',
    300: '#94d1cb', // Muted text on dark backgrounds
    700: '#2e6b65',
  },
  // Evergreen accent
  evergreen: {
    500: '#08f774',
  },
  white: '#ffffff',
} as const;

export type ColorTokens = typeof colors;


