/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./**/*.js",
    "!./node_modules/**/*"
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF',
          light: '#3B82F6',
          dark: '#1E3A8A',
        },
        cta: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
        },
        background: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          input: '#FFFFFF',
        },
        text: {
          DEFAULT: '#1E3A8A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        success: '#1CC88A',
        warning: '#F6C23E',
        danger: '#E74A3B',
      },
      fontFamily: {
        heading: ['Lexend', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
      },
      spacing: {
        xs: '0.25rem',    // 4px
        sm: '0.5rem',     // 8px
        md: '1rem',       // 16px
        lg: '1.5rem',     // 24px
        xl: '2rem',       // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem',    // 64px
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'DEFAULT': '0 4px 6px rgba(0,0,0,0.1)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.15)',
        'card': '0 10px 40px rgba(0,0,0,0.08)',
        'card-hover': '0 15px 30px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'card': '1.25rem',  // 20px
        'section': '0.9375rem',  // 15px
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
