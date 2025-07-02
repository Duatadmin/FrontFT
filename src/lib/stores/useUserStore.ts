import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import type { User } from '@supabase/supabase-js';

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** one-time initializer; safe to call many times */
  boot: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
}

let booted = false; // avoid double-init on hot reloads

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

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
          set({
            user: data.session?.user ?? null,
            isAuthenticated: !!data.session,
            isLoading: false,
          });
        }

        // subscribe to further changes
        supabase.auth.onAuthStateChange((_ev, session) => {
          set({
            user: session?.user ?? null,
            isAuthenticated: !!session,
          });
        });
      },

      /* ② email-password login ******************************************* */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        console.log('[useUserStore] Starting login process...');
        
        const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('[useUserStore] Login error:', error);
          set({ error: error.message, isLoading: false });
          return;
        }

        console.log('[useUserStore] Login successful, checking user status...');
        console.log('[useUserStore] Full user object:', session?.user);
        console.log('[useUserStore] User metadata:', session?.user.user_metadata);
        console.log('[useUserStore] App metadata:', session?.user.app_metadata);
        
        // Check multiple possible locations for banned_until
        const userMetadataBanned = (session?.user.user_metadata as any)?.banned_until;
        const appMetadataBanned = (session?.user.app_metadata as any)?.banned_until;
        const rawUserBanned = (session?.user as any)?.banned_until;
        
        // Use the first available banned_until value
        const bannedUntil = userMetadataBanned || appMetadataBanned || rawUserBanned;
        const banned = bannedUntil && new Date(bannedUntil) > new Date();
        
        console.log('[useUserStore] bannedUntil from user_metadata:', userMetadataBanned);
        console.log('[useUserStore] bannedUntil from app_metadata:', appMetadataBanned);
        console.log('[useUserStore] bannedUntil from raw user:', rawUserBanned);
        console.log('[useUserStore] Final bannedUntil:', bannedUntil);
        console.log('[useUserStore] User is banned:', banned);

        if (banned) {
          console.log('[useUserStore] User is banned, initiating checkout...');
          try {
            console.log('[useUserStore] Calling create-checkout-session function...');
            const { data, error } = await supabase.functions.invoke(
              'create-checkout-session',
              { body: { user_id: session!.user.id } }
            );
            
            console.log('[useUserStore] Checkout session response:', { data, error });
            
            if (error) {
              console.error('[useUserStore] Edge function error:', error);
              throw error;
            }
            
            if (!data?.sessionId) {
              console.error('[useUserStore] No session ID received:', data);
              throw new Error('No session ID received from checkout');
            }
            
            console.log('[useUserStore] Redirecting to Stripe checkout...');
            const stripe = await getStripe();
            const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
            
            if (result.error) {
              console.error('[useUserStore] Stripe redirect error:', result.error);
              throw result.error;
            }
          } catch (checkoutError) {
            console.error('[useUserStore] Checkout error:', checkoutError);
            set({ 
              error: `Failed to initiate checkout: ${checkoutError instanceof Error ? checkoutError.message : 'Unknown error'}`, 
              isLoading: false 
            });
          }
        } else {
          console.log('[useUserStore] User is not banned, proceeding normally');
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