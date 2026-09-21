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
        background: '#07111F',
        secondary: '#0D1B2A',
        card: '#12263A',
        border: '#1E4055',
        accent: {
          cyan: '#00D9FF',
          green: '#00FF9C'
        },
        text: {
          main: '#F5F7FA',
          muted: '#8FA3B8'
        },
        status: {
          normal: '#00FF9C',
          warning: '#FFB020',
          critical: '#FF4D4D',
          sensor: '#00D9FF',
          offline: '#8FA3B8'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
