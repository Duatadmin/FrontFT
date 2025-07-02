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
        const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          set({ error: error.message, isLoading: false });
        } else {
          const bannedUntil = (session?.user.user_metadata as any)?.banned_until;
          const banned = bannedUntil && new Date(bannedUntil) > new Date();

          if (banned) {
            try {
              const { data, error } = await supabase.functions.invoke(
                'create-checkout-session',
                { body: { user_id: session!.user.id } }
              );
              if (error) throw error;
              const stripe = await getStripe();
              await stripe.redirectToCheckout({ sessionId: data.sessionId });
            } catch (checkoutError) {
              console.error('Checkout error:', checkoutError);
              set({ error: 'Failed to initiate checkout', isLoading: false });
            }
          } else {
            // User is not banned, proceed normally
            set({ isLoading: false });
            // Navigate to app (this will be handled by the component using this store)
          }
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