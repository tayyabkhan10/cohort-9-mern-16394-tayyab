/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14213D',
          soft: '#2C3E63'
        },
        paper: '#FBF9F4',
        canvas: {
          DEFAULT: '#F1EDE2',
          line: '#E2DACB'
        },
        accent: {
          DEFAULT: '#1F6F6B',
          soft: '#E4EFEE'
        },
        amber: '#C98A17',
        danger: {
          DEFAULT: '#B3261E',
          soft: '#F7E6E4',
          hover: '#f0d3d0'
        },
        body: {
          DEFAULT: '#1C1B17',
          muted: '#6B6559'
        }
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Courier New"', 'monospace']
      },
      borderRadius: {
        card: '3px'
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 33, 61, 0.06), 0 4px 12px rgba(20, 33, 61, 0.05)',
        lift: '0 8px 24px rgba(20, 33, 61, 0.14)'
      },
      screens: {
        // matches the original 720px breakpoint (default md is 768px)
        stack: { max: '720px' }
      }
    }
  },
  plugins: []
};