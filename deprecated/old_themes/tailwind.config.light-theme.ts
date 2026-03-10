import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui semantic color keys (Tailwind v3 — must mirror CSS variables)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        // Uraan design tokens
        'uraan-bg': 'var(--color-bg)',
        'uraan-surface': 'var(--color-surface)',
        'uraan-surface-alt': 'var(--color-surface-alt)',
        'uraan-border': 'var(--color-border)',
        'uraan-text': 'var(--color-text-primary)',
        'uraan-secondary': 'var(--color-text-secondary)',
        'uraan-muted': 'var(--color-text-muted)',
        'uraan-accent': 'var(--color-accent)',
        'uraan-accent-muted': 'var(--color-accent-muted)',
        'admin-bg': 'var(--color-admin-bg)',
        'admin-surface': 'var(--color-admin-surface)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-playfair)', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
}
export default config
