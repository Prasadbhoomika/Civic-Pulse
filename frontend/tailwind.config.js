/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#05070D',
          surface: '#0B101A',
          card: '#101827',
          border: 'rgba(0, 229, 255, 0.15)',
          cyan: '#00E5FF',
          magenta: '#FF2BD6',
          green: '#7CFF4F',
          amber: '#FFB020',
          red: '#FF3B5C',
          text: '#EAF7FF',
          muted: '#718096'
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(0, 229, 255, 0.25)',
        'magenta-glow': '0 0 15px rgba(255, 43, 214, 0.25)',
        'red-glow': '0 0 15px rgba(255, 59, 92, 0.3)',
        'hud': 'inset 0 0 20px rgba(0, 229, 255, 0.05)'
      },
      backgroundImage: {
        'cyber-grid': "radial-gradient(circle, rgba(0,229,255,0.07) 1px, transparent 1px)",
        'scanlines': "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)"
      }
    },
  },
  plugins: [],
}
