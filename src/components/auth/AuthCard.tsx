// src/components/auth/AuthCard.tsx
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase'; // Adjusted import path
import JarvisLogo from './JarvisLogo';

export default function AuthCard() {
  return (
    <div className="relative z-10 w-full max-w-[440px] rounded-[12px] bg-[#1d1d1d] p-8 shadow-xl shadow-orange-700/15">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <JarvisLogo className="h-10 w-10 text-white" /> {/* Added text-white for monochrome logo if SVG uses currentColor */}
        <h1 className="text-3xl font-bold text-white">Jarvis</h1>
      </div>

      <Auth
        supabaseClient={supabase}
        providers={['google', 'facebook', 'twitter']}
        socialLayout="horizontal"
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#ff6700',
                brandAccent: '#ff6700', // Kept same as brand for consistency with spec
                // You might want a slightly darker shade for brandAccent e.g. #e65c00
              },
              radii: {
                // input: '8px', // This was in your spec, but Supabase Auth UI uses 'inputBorderRadius'
                // button: '8px',// This was in your spec, but Supabase Auth UI uses 'buttonBorderRadius' or 'borderRadiusButton'
                inputBorderRadius: '8px', 
                borderRadiusButton: '8px',
              },
            },
          },
          className: {
            // Styles for all buttons within the Auth component.
            // The w-9 h-9 will make all buttons (social + primary submit) 36x36px.
            // This might not be ideal for the primary submit button.
            // Consider if these styles should only apply to social buttons via more specific CSS overrides if needed.
            container: 'p-0 mb-4', // Removes inner Auth padding and adds margin-bottom for spacing.
            anchor: 'text-xs text-center', // Styles for links like 'Forgot password', 'Sign up'.
            // label: '', // For input labels
            // input: '', // For input fields - Rely on ThemeSupa dark mode
            // button: '', // Rely on ThemeSupa dark mode
            // message: '', // For error/info messages
            // divider: '', // For the divider (e.g., "OR")
          },
        }}
        theme="dark"
      />
    </div>
  );
}
