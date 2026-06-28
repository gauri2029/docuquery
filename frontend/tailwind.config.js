/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Deep teal accent (editorial developer-tool palette)
        brand: {
          50: '#f1f7f6',
          100: '#d9ebe8',
          200: '#b3d7d1',
          300: '#84bbb3',
          400: '#519a91',
          500: '#327d74',
          600: '#22655d',
          700: '#1d514b',
          800: '#19413d',
          900: '#163734',
        },
        // Warm off-white surfaces + charcoal ink
        paper: {
          DEFAULT: '#faf8f4',
          50: '#fdfcfa',
          100: '#f6f3ec',
          200: '#ece7dc',
        },
        // Warm sand for distinct panel tones
        sand: {
          50: '#f7f1e6',
          100: '#efe6d4',
          200: '#e2d4ba',
          300: '#d2bd99',
        },
        ink: {
          DEFAULT: '#2b2a28',
          soft: '#54514c',
          faint: '#8a857d',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
