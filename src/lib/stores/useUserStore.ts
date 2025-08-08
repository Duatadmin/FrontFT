import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { SubscriptionService, type SubscriptionStatus } from '@/lib/services/subscriptionService';

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingComplete: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  /** one-time initializer; safe to call many times */
  boot: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
  updateOnboardingStatus: (complete: boolean) => Promise<void>;
  checkSubscription: () => Promise<void>;
}

let booted = false; // avoid double-init on hot reloads
let authSubscription: { unsubscribe: () => void } | null = null;

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      onboardingComplete: false,
      subscriptionStatus: null,

      /* ① one-time boot ************************************************** */
      boot: async () => {
        if (booted) {
          console.log('[useUserStore] Already booted, skipping...');
          return;
        }
        booted = true;
        console.log('[useUserStore] Booting user store...');

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
          
          console.log('[useUserStore] Initial session loaded:', {
            hasUser: !!user,
            userId: user?.id,
            isAuthenticated: !!data.session,
            onboardingComplete
          });
          
          set({
            user,
            isAuthenticated: !!data.session,
            isLoading: false,
            onboardingComplete,
          });
        }

        // Unsubscribe from previous listener if exists
        if (authSubscription) {
          authSubscription.unsubscribe();
        }

        // subscribe to further changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[useUserStore] Auth state changed:', event, { hasSession: !!session });
          
          // Don't set loading state on auth state changes to avoid UI flashing
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
            // Keep isLoading false to avoid "Loading user..." during navigation
            isLoading: false,
          });
        });
        
        authSubscription = authListener.subscription;
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
        // Don't set isLoading to true during logout to avoid UI flashing
        set({ error: null });
        console.log('[useUserStore] Logging out...');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('[useUserStore] Logout error:', error);
          set({ error: error.message });
        } else {
          console.log('[useUserStore] Logout successful');
          // Clear subscription cache on logout
          SubscriptionService.clearCache();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            subscriptionStatus: null,
            onboardingComplete: false
          });
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
          
          // If marking as complete, ensure we don't redirect back to onboarding
          if (complete) {
            // Clear any pending redirects by updating the state
            set({ onboardingComplete: true });
          }
        }
      },
      
      /* ⑥ check subscription status ************************************* */
      checkSubscription: async () => {
        const user = get().user;
        if (!user) {
          console.log('[useUserStore] No user to check subscription for');
          // Don't clear existing status if we're just between auth states
          const currentStatus = get().subscriptionStatus;
          if (!currentStatus) {
            set({ 
              subscriptionStatus: { 
                isActive: false, 
                status: 'unknown',
                error: 'No user authenticated'
              }
            });
          }
          return;
        }
        
        try {
          console.log('[useUserStore] Checking subscription status...');
          const status = await SubscriptionService.checkSubscriptionStatus(user);
          set({ subscriptionStatus: status });
          console.log('[useUserStore] Subscription status updated:', status);
        } catch (error) {
          console.error('[useUserStore] Failed to check subscription:', error);
          // Keep existing status on network errors
          const currentStatus = get().subscriptionStatus;
          
          // Only set error status if it's not a network error (which should be retried)
          if (!(error instanceof Error && error.message.includes('Network error'))) {
            const errorStatus = {
              isActive: currentStatus?.isActive || false, // Preserve active state if known
              status: 'unknown' as const,
              error: error instanceof Error ? error.message : 'Failed to check subscription'
            };
            set({ subscriptionStatus: errorStatus });
          }
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