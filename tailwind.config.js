/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep': 'var(--bg-deep)',
        'bg-panel': 'var(--bg-panel)',
        'bg-card': 'rgba(255, 255, 255, 0.03)', // Keep translucent
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'text-gold': 'var(--text-gold)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
