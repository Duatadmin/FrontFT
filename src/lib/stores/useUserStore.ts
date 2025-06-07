import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Session, AuthChangeEvent, User } from '@supabase/supabase-js';
import { supabase } from '../supabase'; // Corrected path
import { toast } from '../utils/toast'; // Added for notifications

/**
 * ------- Types -------
 */
export type UserProfile = {
  id: string;
  email: string;
  nickname: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  /** Инициализация авторизации (вызывается один раз при старте приложения) */
  boot: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, data?: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: (userId?: string) => Promise<UserProfile | null>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export type UserStore = AuthState & AuthActions;

/**
 * ------- Utilities -------
 */
const logDev = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[useUserStore]', ...args);
  }
};

const GENERIC_ERROR = 'Что‑то пошло не так. Попробуйте ещё раз.';

// Глобальная отписка, чтобы не плодить слушателей при HMR / нескольких инстансах стора
let globalAuthUnsub: (() => void) | null = (globalThis as any).__SUPABASE_AUTH_UNSUB || null;

/**
 * ------- Store Implementation -------
 */
const initializer: StateCreator<UserStore> = (set, get) => {
  const safeSet: typeof set = (partial, replace) => {
    set(partial, replace);
  };

  const handleAuthChange = async (event: AuthChangeEvent, session: Session | null) => {
    logDev('[AuthListener] Event:', event, 'Session:', session);

    switch (event) {
      case 'INITIAL_SESSION':
      case 'SIGNED_IN':
        if (session?.user) {
          try {
            logDev('[AuthListener] User session found. Fetching profile for user:', session.user.id);
            const profile = await get().fetchUserProfile(session.user.id);
            logDev('[AuthListener] Profile fetched:', profile);
            safeSet({
              user: session.user,
              profile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (profileError: any) {
            console.error('[AuthListener] Error fetching profile:', profileError);
            safeSet({
              user: session.user, // Keep user data even if profile fetch fails
              profile: null,
              isAuthenticated: true, // Still authenticated, but profile is missing
              isLoading: false,
              error: 'Failed to fetch user profile.',
            });
            if (typeof window !== 'undefined') {
              toast.error('Failed to fetch user profile.');
            }
          }
        } else {
          // No user session (e.g., INITIAL_SESSION with no one logged in)
          logDev('[AuthListener] No active user session.');
          safeSet({ user: null, profile: null, isAuthenticated: false, isLoading: false, error: null });
        }
        break;
      case 'SIGNED_OUT':
        logDev('[AuthListener] User signed out.');
        safeSet({ user: null, profile: null, isAuthenticated: false, isLoading: false, error: null });
        break;
      case 'TOKEN_REFRESHED':
        logDev('[AuthListener] Token refreshed. Session:', session);
        if (session?.user && !get().user) {
          // If for some reason the user was not set but token refresh provides one (edge case)
          logDev('[AuthListener] User was null, but token refresh provided a user. Re-populating.');
          const profile = await get().fetchUserProfile(session.user.id);
          safeSet({ user: session.user, profile, isAuthenticated: true, isLoading: false });
        } else if (!session?.user && get().user) {
          // If token refresh results in no user, treat as sign out (edge case)
          logDev('[AuthListener] Token refresh resulted in no user. Signing out.');
          safeSet({ user: null, profile: null, isAuthenticated: false, isLoading: false, error: null });
        }
        // Typically, isLoading should not change on TOKEN_REFRESHED unless session validity changes.
        break;
      case 'USER_UPDATED':
        logDev('[AuthListener] User updated. New user data:', session?.user);
        if (session?.user) {
          const updatedProfile = await get().fetchUserProfile(session.user.id); // Re-fetch profile if user attributes changed
          safeSet({ user: session.user, profile: updatedProfile });
        }
        break;
      case 'PASSWORD_RECOVERY':
        logDev('[AuthListener] Password recovery event.');
        // Typically no change to auth state here, UI might show a message.
        break;
      default:
        logDev('[AuthListener] Unhandled auth event:', event);
    }
  };

  if (!globalAuthUnsub) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    if (subscription) {
      globalAuthUnsub = () => subscription.unsubscribe();
      (globalThis as any).__SUPABASE_AUTH_UNSUB = globalAuthUnsub;
      logDev('Subscribed to Supabase auth state changes.');
    } else if (process.env.NODE_ENV === 'development') {
      console.error('[UserStore] Failed to subscribe to Supabase auth state changes.');
    }

    if (typeof window !== 'undefined' && !(globalThis as any).__BEFORE_UNLOAD_SET__) {
      const beforeUnloadHandler = () => {
        logDev('beforeunload: Tearing down user store and unsubscribing from Supabase auth changes.');
        tearDownUserStore(); // This should handle unsubscription logic
      };
      window.addEventListener('beforeunload', beforeUnloadHandler);
      (globalThis as any).__BEFORE_UNLOAD_SET__ = true;
      (globalThis as any).__BEFORE_UNLOAD_HANDLER__ = beforeUnloadHandler; // Store handler to potentially remove it if tearDown is called manually
    }
  }

  return {
    /* ---------- State ---------- */
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true, // Start as true, boot() will set it to false
    error: null,

    /* ---------- Actions ---------- */
    clearError() {
      safeSet({ error: null });
    },

    async boot() {
      if (typeof window === 'undefined') {
        logDev('[BOOT] Skipping boot() on server.');
        return;
      }
      logDev('[BOOT] boot() called on client. Initial isLoading:', get().isLoading);
      // Ensure isLoading is true if not already set by initial state, 
      // though onAuthStateChange's INITIAL_SESSION will be the primary driver for setting it to false.
      if (!get().isLoading) {
        // safeSet({ isLoading: true }); // Potentially set isLoading to true if not already.
                                      // However, initial state is isLoading: true, so this might be redundant.
                                      // The key is that onAuthStateChange WILL set it to false.
      }
      logDev('[BOOT] boot() finished. Relying on onAuthStateChange for session and loading state.');
      // The onAuthStateChange listener is set up when the store initializes.
      // The INITIAL_SESSION event will fire and be handled by handleAuthChange,
      // which will then update isLoading, user, profile, and isAuthenticated.
    },

    async login(email, password) {
      console.time('[LOGIN] signInWithPassword');
      logDev('[LOGIN] Attempting for user:', email);
      let loginData: any = null;
      let loginError: any = null;
      try {
        safeSet({ isLoading: true, error: null });
        const response = await supabase.auth.signInWithPassword({ email, password });
        loginData = response.data;
        loginError = response.error;
        if (loginError) throw loginError;
        // onAuthStateChange will handle success and further state updates
      } catch (err: any) {
        logDev('[LOGIN] signInWithPassword error:', err);
        loginError = err; // Ensure error is captured for logging
        safeSet({ error: err.message || GENERIC_ERROR, isLoading: false });
        if (typeof window !== 'undefined') {
          toast.error(err.message || GENERIC_ERROR);
        }
      } finally {
        console.timeEnd('[LOGIN] signInWithPassword');
        console.log('[LOGIN] signInWithPassword completed. Data:', loginData ? !!loginData.session : false, 'Error:', loginError);
        // isLoading is primarily managed by onAuthStateChange or boot's final outcome
        // If direct login fails, isLoading should be false, which is handled in catch.
      }
    },

    async signUp(email, password, data = {}) {
      console.time('[SIGNUP] signUp');
      logDev('[SIGNUP] Attempting for user:', email);
      let signUpData: any = null;
      let signUpError: any = null;
      try {
        safeSet({ isLoading: true, error: null });
        const emailRedirectTo = typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

        const response = await supabase.auth.signUp({
          email,
          password,
          options: {
            data,
            emailRedirectTo,
          },
        });
        signUpData = response.data;
        signUpError = response.error;

        if (signUpError) throw signUpError;

        if (typeof window !== 'undefined') {
          if (signUpData.user && !signUpData.user.email_confirmed_at) {
            toast.info('Confirmation email sent. Please check your inbox.');
          } else if (signUpData.user) {
            toast.success('Sign up successful!');
          }
        }
        // onAuthStateChange will handle user state and isLoading
      } catch (err: any) {
        logDev('[SIGNUP] signUp error:', err);
        signUpError = err; // Ensure error is captured for logging
        safeSet({ error: err.message || GENERIC_ERROR, isLoading: false });
        if (typeof window !== 'undefined') {
          toast.error(err.message || GENERIC_ERROR);
        }
      } finally {
        console.timeEnd('[SIGNUP] signUp');
        console.log('[SIGNUP] signUp completed. Data:', signUpData ? !!signUpData.user : false, 'Error:', signUpError);
        // isLoading is primarily managed by onAuthStateChange or boot's final outcome
      }
    },

    async logout() {
      try {
        safeSet({ isLoading: true, error: null });
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        // onAuthStateChange will handle setting user to null
      } catch (err) {
        logDev('logout() error:', err);
        safeSet({ error: GENERIC_ERROR, isLoading: false });
        if (typeof window !== 'undefined') {
          toast.error(GENERIC_ERROR);
        }
      }
    },

    async fetchUserProfile(userId?: string) {
      const idToFetch = userId ?? get().user?.id;
      if (!idToFetch) {
        logDev('fetchUserProfile: No user ID available.');
        return null;
      }
      // Do not set isLoading here, this is often a background task or part of another flow
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, nickname, avatar_url, created_at')
          .eq('id', idToFetch)
          .single<UserProfile>();
        if (error) throw error;
        return data;
      } catch (err) {
        logDev('fetchUserProfile() error:', err);
        // Do not set global error for this, as it might be an internal call
        // toast.error('Failed to fetch user profile.');
        return null;
      }
    },

    async updateProfile(profileUpdates: Partial<UserProfile>) {
      const currentUserId = get().user?.id;
      if (!currentUserId) {
        const errMessage = 'User not authenticated to update profile.';
        logDev(errMessage);
        safeSet({ error: errMessage });
        if (typeof window !== 'undefined') {
          toast.error(errMessage);
        }
        return;
      }
      try {
        safeSet({ isLoading: true, error: null });
        const { error } = await supabase
          .from('users')
          .update(profileUpdates)
          .eq('id', currentUserId);
        if (error) throw error;
        
        const updatedProfile = await get().fetchUserProfile(currentUserId); // Re-fetch for consistency
        if (updatedProfile) {
          safeSet({ profile: updatedProfile });
          if (typeof window !== 'undefined') {
            toast.success('Profile updated successfully!');
          }
        } else {
          if (typeof window !== 'undefined') {
            toast.info('Profile updated, but could not immediately re-fetch details.');
          }
        }
      } catch (err: any) {
        logDev('updateProfile() error:', err);
        const errorMessage = err.message || GENERIC_ERROR;
        safeSet({ error: errorMessage, isLoading: false });
        if (typeof window !== 'undefined') {
          toast.error(errorMessage);
        }
      } finally {
        safeSet({ isLoading: false });
      }
    },

    async resetPassword(email: string) {
      try {
        safeSet({ isLoading: true, error: null });
        const redirectTo = typeof window !== 'undefined'
          ? `${window.location.origin}/account/update-password`
          : undefined;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        if (error) throw error;
        if (typeof window !== 'undefined') {
          toast.info('Password reset email sent. Please check your inbox.');
        }
      } catch (err) {
        logDev('resetPassword() error:', err);
        safeSet({ error: GENERIC_ERROR, isLoading: false });
        if (typeof window !== 'undefined') {
          toast.error(GENERIC_ERROR);
        }
      } finally {
        safeSet({ isLoading: false });
      }
    },
  };
};

export const useUserStore = process.env.NODE_ENV === 'development'
  ? create<UserStore>()(devtools(initializer, { name: 'UserStore' }))
  : create<UserStore>()(initializer);

/**
 * Побочный helper — вызовите в тестах или при hot‑reload, чтобы гарантированно очистить слушатель
 */
export function tearDownUserStore() {
  logDev('tearDownUserStore() called.');
  globalAuthUnsub?.();
  globalAuthUnsub = null;
  delete (globalThis as any).__SUPABASE_AUTH_UNSUB;
  // Zustand's devtools middleware adds a destroy method to the store itself.
  // If not using devtools (e.g. in prod if storeCreator is just initializer),
  // this destroy method won't exist on useUserStore directly.
  // The globalAuthUnsub handles the primary listener.
  const storeWithDestroy = useUserStore as any;
  if (typeof storeWithDestroy.destroy === 'function') {
    logDev('Calling useUserStore.destroy()');
    storeWithDestroy.destroy();
  }
};

// Removed automatic boot() call