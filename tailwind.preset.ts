import defaultTheme from 'tailwindcss/defaultTheme';

// Workaround for TS issue - we're only using this as a preset, not a full config
// @ts-ignore
export default {
  theme: {
    extend: {
      // Base spacing unit of 4px for grid alignment
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '44': '176px',
        '48': '192px',
        '52': '208px',
        '56': '224px',
        '60': '240px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '96': '384px',
      },
      colors: {
        // New color tokens matching the reference design
        background: '#050608',     // Dark background
        'background-surface': '#0F1014', // Surface background
        'background-card': '#1C1D24',    // Card background
        'accent-violet': '#8B5CF6',      // Primary accent
        'accent-green': '#10a37f',       // Secondary accent
        'accent-pink': '#E879F9',        // Tertiary accent
        'text-primary': '#FFFFFF',       // Primary text
        'text-secondary': '#A0A0B0',     // Secondary text
        'text-tertiary': '#6B6B7B',      // Tertiary text
        'border-light': 'rgba(255, 255, 255, 0.1)', // Light border
        'border-dark': 'rgba(0, 0, 0, 0.2)', // Dark border
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '30px' }],
        '2xl': ['24px', { lineHeight: '36px' }],
        '3xl': ['30px', { lineHeight: '40px' }],
        '4xl': ['36px', { lineHeight: '48px' }],
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Inter Mono', ...defaultTheme.fontFamily.mono],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.35)',
        'none': 'none',
      },
      transitionProperty: {
        'DEFAULT': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
        'all': 'all',
      },
      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'DEFAULT': '150ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-in-up': {
          'from': { transform: 'translateY(8px)', opacity: '0' }, 
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'hover-lift': {
          'from': { transform: 'translateY(0)' },
          'to': { transform: 'translateY(-4px)' },
        },
        'count-up': {
          'from': { transform: 'translateY(100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-accent': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-in-up': 'slide-in-up 0.2s ease-out',
        'hover-lift': 'hover-lift 0.15s ease-out forwards',
        'count-up': 'count-up 0.5s ease-out forwards',
        'pulse-accent': 'pulse-accent 2s ease-in-out infinite',
      },
      // Add custom CSS variables
      variables: {
        '--space': '4px', // Base grid unit
      },
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        ':root': {
          '--space': '4px',
        },
      });
    },
    function({ addUtilities }) {
      const utilities = {
        '.grid-baseline': {
          'display': 'grid',
          'gap': 'var(--space)',
        },
        '.hover-lift': {
          'transition': 'transform 150ms ease-out, box-shadow 150ms ease-out',
          '&:hover': {
            'transform': 'translateY(-4px)',
            'box-shadow': '0 4px 20px rgba(0, 0, 0, 0.35)',
          },
        },
        '.press-effect': {
          'transition': 'transform 75ms ease-out',
          '&:active': {
            'transform': 'scale(0.95)',
          },
        },
        '.backdrop-blur-card': {
          'backdrop-filter': 'blur(8px)',
        },
      };
      addUtilities(utilities);
    },
  ],
};
