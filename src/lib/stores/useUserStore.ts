import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingComplete: boolean;
  /** one-time initializer; safe to call many times */
  boot: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
  updateOnboardingStatus: (complete: boolean) => Promise<void>;
}

let booted = false; // avoid double-init on hot reloads

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      onboardingComplete: false,

      /* ① one-time boot ************************************************** */
      boot: async () => {
        if (booted) return;
        booted = true;

        // initial session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[useUserStore] boot() error', error);
          set({ error: error.message, isLoading: false });
        } else {
          const user = data.session?.user ?? null;
          let onboardingComplete = false;
          
          // If we have a user, fetch their onboarding status
          if (user) {
            const { data: userData } = await supabase
              .from('users')
              .select('onboarding_complete')
              .eq('id', user.id)
              .single();
            
            onboardingComplete = userData?.onboarding_complete ?? false;
          }
          
          set({
            user,
            isAuthenticated: !!data.session,
            isLoading: false,
            onboardingComplete,
          });
        }

        // subscribe to further changes
        supabase.auth.onAuthStateChange(async (_ev, session) => {
          const user = session?.user ?? null;
          let onboardingComplete = false;
          
          if (user) {
            const { data: userData } = await supabase
              .from('users')
              .select('onboarding_complete')
              .eq('id', user.id)
              .single();
            
            onboardingComplete = userData?.onboarding_complete ?? false;
          }
          
          set({
            user,
            isAuthenticated: !!session,
            onboardingComplete,
          });
        });
      },

      /* ② email-password login ******************************************* */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        console.log('[useUserStore] Starting login process...');
        
        const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('[useUserStore] Login error details:', {
            message: error.message,
            status: error.status,
            name: error.name,
            cause: error.cause
          });
          
          // Provide more specific error messages
          let userFriendlyError = error.message;
          if (error.message.includes('Invalid login credentials')) {
            userFriendlyError = 'Invalid email or password. Please check your credentials.';
          } else if (error.message.includes('Email not confirmed')) {
            userFriendlyError = 'Please check your email and confirm your account before logging in.';
          } else if (error.status === 400) {
            userFriendlyError = 'Login failed. Please check your email and password.';
          }
          
          set({ error: userFriendlyError, isLoading: false });
          return;
        }

        console.log('[useUserStore] Login successful! User:', session?.user?.email);
        
        // Fetch onboarding status after successful login
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('onboarding_complete')
            .eq('id', session.user.id)
            .single();
          
          set({
            onboardingComplete: userData?.onboarding_complete ?? false,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      },

      /* ③ logout ********************************************************* */
      logout: async () => {
        set({ isLoading: true, error: null });
        const { error } = await supabase.auth.signOut();
        if (error) {
          set({ error: error.message, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      /* ④ helpers ******************************************************** */
      getCurrentUser: () => get().user,
      
      /* ⑤ update onboarding status ************************************** */
      updateOnboardingStatus: async (complete: boolean) => {
        const user = get().user;
        if (!user) {
          console.error('[useUserStore] No user to update onboarding status');
          return;
        }
        
        // Don't set isLoading to true - just update the error state
        set({ error: null });
        
        const { error } = await supabase
          .from('users')
          .update({ onboarding_complete: complete })
          .eq('id', user.id);
        
        if (error) {
          console.error('[useUserStore] Failed to update onboarding status:', error);
          set({ error: error.message });
        } else {
          // Update only the onboarding status
          set({ onboardingComplete: complete });
          console.log('[useUserStore] Onboarding status updated to:', complete);
        }
      },
    }),
    { name: 'user-store' },
  ),
);

// dev helper: window.useUserStore
if (import.meta.env.MODE !== 'production' && typeof window !== 'undefined') {
  // @ts-ignore
  (window as any).useUserStore = useUserStore;
}

export default useUserStore;