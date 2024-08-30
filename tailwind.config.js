/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./apps/**/*.{html,ts}', './libs/**/*.{html,ts}'],
  plugins: [require('daisyui'), require('tailwindcss-animated')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          neutral: 'white',
          'neutral-content': '#1f2837',
        },
      },
      {
        dark: {
          ...require('daisyui/src/theming/themes')['dark'],
        },
      },
    ],
  },
  darkMode: ['class', '[data-theme="dark"]'],
};
