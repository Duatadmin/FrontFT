import { ThemeSupa } from '@supabase/auth-ui-shared';

export const customAuthUITheme = {
  // Using ThemeSupa.default as a base for the light theme variant
  default: ThemeSupa.default,

  dark: {
    ...ThemeSupa.dark, // Base dark theme properties
    colors: {
      ...ThemeSupa.dark.colors, // Base dark theme colors
      brand: '#f45d09',                            // Main brand color (e.g., for primary buttons)
      brandAccent: '#ff8a1f',                      // Accent color for hover/focus states
      brandButtonText: 'white',                   // Text color for brand buttons

      defaultButtonBackground: '#242424',          // Background for social auth buttons
      defaultButtonBackgroundHover: '#3e3e3e',    // Hover background for social auth buttons
      defaultButtonBorder: '#2e2e2e',              // Border for social auth buttons
      defaultButtonText: '#eaeaea',                // Text color for social auth buttons (if needed, default is often white)

      inputBackground: '#131313',
      inputBorder: '#2e2e2e',
      inputText: '#eaeaea',                        // Text color for inputs
      inputPlaceholder: '#6c6c6c',               // Placeholder text color for inputs
    },
    radii: {
      ...ThemeSupa.dark.radii,
      inputBorderRadius: '0.875rem', // 14px
      buttonBorderRadius: '0.875rem', // 14px
    },
  },
} as const;
