/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
      },
      colors: {
        verde: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#065F46' },
        vermelho: { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#7F1D1D' },
        azul: { DEFAULT: '#3B82F6', light: '#DBEAFE', dark: '#1E3A8A' },
        fundo: '#F8F9FB',
        card: '#FFFFFF',
        borda: '#E5E7EB',
        texto: { DEFAULT: '#111827', secundario: '#6B7280', fraco: '#9CA3AF' },
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem', '3xl': '2rem' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        float: '0 8px 24px rgba(16,185,129,0.35)',
      },
    },
  },
  plugins: [],
};
