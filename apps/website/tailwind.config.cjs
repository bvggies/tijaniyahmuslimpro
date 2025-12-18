/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  presets: [require('../../packages/ui/tailwind.preset.cjs')],
};



