import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display-serif': ['var(--font-dm-serif)', 'serif'],
        'editorial': ['var(--font-dm-serif)', 'serif'],
        'display-sans': ['var(--font-dm-sans)', 'sans-serif'],
        'body': ['var(--font-dm-sans)', 'sans-serif'],
        'mono': ['var(--font-space-mono)', 'monospace'],
        'label': ['var(--font-space-mono)', 'monospace'],
      },
      colors: {
        // Shvasa Primary Palette
        primary: '#2D5A27',         // Forest (deep organic green)
        'primary-dark': '#1F401B',
        'primary-light': '#7DBF6E',  // Leaf (vibrant light green)
        'primary-container': '#EAF5E2',
        'primary-fixed': '#BCF0AE',
        'primary-fixed-dim': '#A1D494',
        'on-primary': '#FFFFFF',
        'on-primary-fixed': '#002201',
        'on-primary-fixed-variant': '#23501E',

        // Secondary
        secondary: '#2D6B25',
        'secondary-container': '#ACF19A',
        'secondary-fixed': '#AFF49D',
        'secondary-fixed-dim': '#94D783',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#327029',

        // Background & Surface
        background: '#FDFBF7',       // Cream (warm off-white)
        surface: '#FDFBF7',
        'surface-bright': '#FDFBF7',
        'surface-container': '#EFEEEA',
        'surface-container-low': '#F5F3EF',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-high': '#EAE8E4',
        'surface-container-highest': '#E4E2DE',
        'surface-dim': '#DBDAD6',
        'surface-variant': '#E4E2DE',
        'surface-tint': '#3B6934',

        // Text colors
        'on-surface': '#3A2E1E',     // Bark (deep warm brown)
        'on-surface-variant': '#42493E',
        'on-background': '#3A2E1E',

        // Accent & Tertiary
        tertiary: '#453724',
        'tertiary-container': '#5D4E39',
        'tertiary-fixed': '#F6DFC3',
        'tertiary-fixed-dim': '#D9C3A8',
        'on-tertiary': '#FFFFFF',
        'on-tertiary-container': '#D5C0A5',
        'on-tertiary-fixed': '#251A08',
        'on-tertiary-fixed-variant': '#534430',

        // Error
        error: '#BA1A1A',
        'error-container': '#FFDAD6',
        'on-error': '#FFFFFF',
        'on-error-container': '#93000A',

        // Inverse
        'inverse-surface': '#30312E',
        'inverse-primary': '#A1D494',
        'inverse-on-surface': '#F2F0ED',

        // Outline
        outline: '#72796E',
        'outline-variant': '#C2C9BB',

        // Utilities
        mist: '#FDFAF4',
        earth: '#F5EDD8',
        'earth-deep': '#EDE0C4',
        gold: '#E8A000',
        'gold-light': '#F5C842',
        forest: '#2D5A27',
        bark: '#3A2E1E',
        'bark-mid': '#6B5B45',
        'bark-light': '#A08060',
        leaf: '#7DBF6E',
      },
      borderRadius: {
        'card': '14px',
        'pill': '9999px',
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      boxShadow: {
        'ambient': '0 10px 30px -10px rgba(58, 46, 30, 0.08)',
        'glow': '0 0 40px 0 rgba(45, 90, 39, 0.3)',
        'soft': '0 4px 20px -4px rgba(58, 46, 30, 0.08)',
      },
      animation: {
        'breath-slow': 'breath 4s ease-in-out infinite',
        'breath-medium': 'breath 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'growth-pulse': 'growthPulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        growthPulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(1.2)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        mid: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
