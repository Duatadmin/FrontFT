const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Keep class-based dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,css}", "./node_modules/@supabase/**/**.{js,ts,jsx,tsx}"],
  presets: [require('./tailwind.preset.ts')],
  theme: {
    extend: {
      colors: {
        // New Core Palette
        'dark-olive': '#454A1E',
        'dark-surface': '#242424',
        'accent-lime': '#DFF250',
        'accent-orange': '#F2A03D',
        'accent-red': '#F24949',
        'accent-mint': '#4AA181',

        // Text Colors from New Palette
        'text': '#FFFFFF',           // Replaces old 'text', aligns with new 'text-primary'
        'text-secondary': '#BFBFBF', // Replaces old 'textSecondary'

        // Semantic mappings / updates to existing keys from old config
        'primary': '#DFF250',          // Old 'primary' (#10a37f) now maps to 'accent-lime' for primary actions
        'background': '#2A2A2A',       // Old 'background' (#202123) maps to 'dark-surface'. Olive gradient is separate.
        'surface': '#242424',          // Old 'surface' (#343541) maps to 'dark-surface'
        'input': '#2A2A2A',            // Old 'input' (#40414f) maps to 'dark-surface'
        'border': 'rgba(255, 255, 255, 0.05)', // Kept as is, subtle white border
        'userBubble': '#4AA181',        // Old 'userBubble' (#10a37f) maps to 'accent-mint'
        'botBubble': '#2A2A2A',         // Old 'botBubble' (#343541) maps to 'dark-surface'

        // Explicit semantic mappings as requested by user
        // These ensure that if 'accent-green' etc. are used directly from preset or old habits, they map to new values.
        'accent-green': '#4AA181',      // Maps to new 'accent-mint' value
        'accent-yellow': '#F2A03D',     // Maps to new 'accent-orange' value
        'accent-primary': '#DFF250',    // Maps to new 'accent-lime' value
        // Note: 'accent-red' as a semantic key is covered by its direct definition in the New Core Palette.
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
        'gradient-radial-olive': 'radial-gradient(120% 120% at 50% 0%, #454A1E 0%, #2A2A2A 100%)',
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