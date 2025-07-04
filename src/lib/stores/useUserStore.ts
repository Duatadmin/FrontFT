import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
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
        // onAuthStateChange will update user/isAuthenticated automatically
        set({ isLoading: false });
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