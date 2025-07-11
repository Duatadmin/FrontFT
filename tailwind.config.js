const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Keep class-based dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,css}", "./node_modules/@supabase/**/**.{js,ts,jsx,tsx}"],
  presets: [require('./tailwind.preset.ts')],
  theme: {
    extend: {
      colors: {
        // New Palette from reference
        'dark-olive': '#454A1E',
        'accent-lime': '#DFF250',
        'accent-orange': '#F2A03D',
        'accent-red': '#F24949',
        'dark-bg': '#2A2A2A',

        // Semantic mappings for new design
        'background': '#2A2A2A', // Main app background
        'surface': '#3c3c3c', // For cards and elevated surfaces
        'primary': '#DFF250',
        'text': '#FFFFFF',
        'text-secondary': '#BFBFBF',
        'border': 'rgba(255, 255, 255, 0.1)', // Subtle border for glass elements

        // Legacy colors - to be phased out
        'userBubble': '#4AA181',
        'botBubble': '#3c3c3c',
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
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      fontFamily: {
        sans: ['Rubik', 'Inter', ...defaultTheme.fontFamily.sans],
        display: ['Rubik', ...defaultTheme.fontFamily.sans],
        rubik: ['Rubik', ...defaultTheme.fontFamily.sans],
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
        },
        // Shine effect for ShinyText
        'shine': {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smoother ease
        'bounce-dot': 'bounce-dot 1.4s infinite ease-in-out both',
        'shine': 'shine 5s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'gradient-radial-olive': 'radial-gradient(120% 120% at 50% 0%, #454A1E 0%, #2A2A2A 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), 
    require('@tailwindcss/typography'),
    function addVariablesForColors({ addBase, theme }) {
      let allColors = flattenColorPalette(theme("colors"));
      let newVars = Object.fromEntries(
        Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
      );

      addBase({
        ":root": newVars,
      });
    },
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
          'background-color': theme('colors.dark-surface', '#2A2A2A'), // Updated to use new dark-surface
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
        '.btn-primary': {
          '@apply text-dark-surface bg-accent-lime hover:bg-accent-orange': {},
        },
        '.badge-success': {
          '@apply text-accent-mint bg-accent-mint/10': {},
        },
        '.badge-error': {
          '@apply text-accent-red bg-accent-red/10': {},
        },
      });
    },
  ],
}