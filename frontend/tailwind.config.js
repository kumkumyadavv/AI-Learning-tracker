/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FBFAF7',
          100: '#F5F3EE',
          200: '#EDEAE2',
          300: '#DFDAD0',
        },
        ink: {
          900: '#1C1B19',
          800: '#2A2825',
          700: '#3A3833',
          600: '#56524C',
          500: '#76716A',
          400: '#9C9690',
          300: '#C4BFB8',
          200: '#E0DCD6',
          100: '#EDEAE5',
        },
        accent: {
          50: '#EEF4FF',
          100: '#D9E5FF',
          200: '#B4CBFF',
          300: '#84A8FF',
          400: '#5B86F0',
          500: '#3A66E0',
          600: '#2348C4',
          700: '#1B3A9E',
          800: '#1A327A',
          900: '#1A2D62',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Iowan Old Style"', '"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        'tracking-wider-2': '0.1em',
      },
    },
  },
  plugins: [],
};
