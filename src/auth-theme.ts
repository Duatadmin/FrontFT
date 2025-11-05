import { ThemeSupa } from '@supabase/auth-ui-shared';

export const customAuthUITheme = {
  ...ThemeSupa,
  dark: {
    ...ThemeSupa.dark,
    colors: {
      ...ThemeSupa.dark.colors,
      brand: '#97a93c',
      brandAccent: '#829336',
      brandButtonText: 'white',
      // Style the social buttons
      defaultButtonBackground: 'transparent',
      defaultButtonBackgroundHover: 'rgba(255, 255, 255, 0.1)',
      defaultButtonBorder: 'rgba(255, 255, 255, 0.2)',
      defaultButtonText: 'white',
      // Other styles
      dividerBackground: '#2e2e2e',
      inputBackground: 'transparent',
      inputBorder: 'rgba(255, 255, 255, 0.2)',
      inputBorderHover: 'gray',
      inputBorderFocus: 'gray',
      inputText: 'white',
      inputPlaceholder: 'darkgray',
    },
    fonts: {
      ...ThemeSupa.dark.fonts,
      buttonFontFamily: 'Montserrat, sans-serif',
    },
    space: {
      ...ThemeSupa.dark.space,
      buttonPadding: '10px 15px',
    },
    radii: {
      ...ThemeSupa.dark.radii,
      borderRadiusButton: '8px',
      inputBorderRadius: '8px',
    },
  },
} as const;
