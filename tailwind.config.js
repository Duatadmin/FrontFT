const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Keep class-based dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@supabase/**/**.{js,ts,jsx,tsx}"],
  presets: [require('./tailwind.preset.ts')],
  theme: {
    extend: {
      // ChatGPT Inspired Palette & Custom Brand Colors
      colors: {
        primary: '#10a37f',      // Accent Green (used for user bubble, focus rings)
        background: '#202123', // Main dark background
        surface: '#343541',    // Slightly lighter background (bot bubbles)
        input: '#40414f',      // Input field background
        border: 'rgba(255, 255, 255, 0.1)', // Subtle white border
        text: '#ECECF1',         // Primary light text
        textSecondary: '#A9A9B3', // Secondary muted text
        userBubble: '#10a37f',  // Explicit user bubble color
        botBubble: '#343541',   // Explicit bot bubble color
        brand: { 
          50:  "#fef3ec", // Lighter shade for new brand
          100: "#fde7d8", // Lighter shade for new brand
          200: "#fbd4ba", // Lighter shade for new brand
          300: "#fac09c", // Lighter shade for new brand
          400: "#f7ab7e", // Lighter shade for new brand
          500: '#f45d09', // Your specified brand color
          600: '#ff8a1f', // Your specified brand accent
          700: '#d95008', // Darker shade for new brand
          800: '#bf4607', // Darker shade for new brand
          900: '#a43d06'  // Darker shade for new brand
        }
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem', // Main rounding
        '2xl': '1.5rem', 
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.15)', // Slightly stronger subtle shadow
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        card: '0 2px 10px rgba(0 0 0 / 0.15)',
        'card-hover': '0 4px 20px rgba(0 0 0 / 0.35)',
      },
      spacing: defaultTheme.spacing,
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      letterSpacing: {
        tight: '-0.02em', // Adjusted tracking
        normal: '0em',
        wide: '0.025em',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-in-up': {
          'from': { transform: 'translateY(12px)', opacity: '0' }, // Slightly more distance
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
         // Refined bounce for typing indicator
         'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.7)', opacity: '0.6' },
          '40%': { transform: 'scale(1.0)', opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smoother ease
        'bounce-dot': 'bounce-dot 1.4s infinite ease-in-out both',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), 
    require('@tailwindcss/typography'),
    function({ addComponents, theme }) {
      addComponents({
        '.dashboard-radial-bg': {
          'position': 'fixed',
          'width': '100vw',
          'height': '100vh',
          'top': '0',
          'left': '0',
          'background': 'radial-gradient(circle at center, rgba(185, 158, 255, 0.1), transparent)',
          'z-index': '-1',
        },
        '.card': {
          'background-color': theme('colors.background-card', '#1C1D24'), // Assuming background-card is preferred or fallback
          'border-radius': theme('borderRadius.xl'), // Using theme token for consistency
          'box-shadow': theme('boxShadow.card'),
          'transition-property': 'transform, box-shadow',
          'transition-timing-function': theme('transitionTimingFunction.out'), // Or 'ease-out'
          'transition-duration': theme('transitionDuration.150'), // Or '150ms'
          '&:hover': {
            'transform': 'translateY(-4px)',
            'box-shadow': theme('boxShadow.card-hover'),
          },
        },
        '.card-header': {
          'display': 'flex',
          'justify-content': 'space-between',
          'align-items': 'center',
          'margin-bottom': '16px',
        },
        '.sidebar-active': {
          'position': 'relative',
          '&::before': {
            'content': '""',
            'position': 'absolute',
            'left': '0',
            'top': '0',
            'bottom': '0',
            'width': '2px',
            'background': 'linear-gradient(to bottom, #8B5CF6, #10a37f)',
            'border-radius': '0 2px 2px 0',
          },
        },
      });
    },
  ],
}