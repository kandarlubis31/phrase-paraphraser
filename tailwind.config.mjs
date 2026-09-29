/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        terminal: {
          deep:   '#060c18',
          bg:     '#0a0a0a',
          surface:'#171717',
          border: '#262626',
          'border-hover': '#404040',
          muted:  '#525252',
          dim:    '#737373',
          body:   '#a3a3a3',
          light:  '#d4d4d4',
          bright: '#e5e5e5',
          white:  '#f8fafc',
        },
        accent: {
          DEFAULT: '#f59e0b',
          dark:    '#d97706',
          blue:    '#0ea5e9',
        },
        success: '#10b981',
        error:   '#ef4444',
        'error-light': '#fca5a5',
      },
    },
  },
  plugins: [],
};
