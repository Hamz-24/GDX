/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primaryHover)',
        accent: 'var(--color-accent)',
        text: 'var(--color-text)',
        textMuted: 'var(--color-textMuted)',
        sidebarBg: '#161618',
        goldAccent: '#F5C542',
        goldAccentHover: '#E5B532',
        darkPill: '#18181B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        display: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'pill': '0 2px 8px rgba(245, 197, 66, 0.25)',
      }
    },
  },
  plugins: [],
}
