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

  const handleAuthChange = async (_event: AuthChangeEvent, session: Session | null) => {
    logDev('AuthChange', _event, session);
    if (session?.user) {
      const profile = await get().fetchUserProfile(session.user.id);
      safeSet({
        user: session.user,
        profile,
        isAuthenticated: true,
        isLoading: false, // Auth change implies loading is done for this transition
      });
    } else {
      safeSet({ user: null, profile: null, isAuthenticated: false, isLoading: false });
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
        console.log('[BOOT] skip – server env');
        return;
      }
      console.log('[BOOT] start');
      console.time('[BOOT] getSession');

      // Initialize data and error to be accessible in finally
      let sessionData: Session | null = null;
      let sessionError: any = null; // Use 'any' for error to match Supabase type, or be more specific
      let userProfile: UserProfile | null = null;

      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: null }; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error('getSession timeout')), 3000)
      );

      try {
        // Use a type assertion for the result of Promise.race if needed, or handle types carefully
        const result = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: Session | null }, error: any | null };
        sessionData = result.data.session;
        sessionError = result.error;

        console.timeEnd('[BOOT] getSession');
        console.log('[BOOT] getSession resolved. Session:', sessionData, 'Error:', sessionError);

        if (sessionError) {
          // This case handles errors returned by getSession itself (not timeout)
          console.error('[BOOT] getSession returned error:', sessionError);
          // toast.error is handled in finally or if specific error handling is needed here
        }

        if (sessionData?.user) {
          console.log('[BOOT] Fetching profile for user:', sessionData.user.id);
          userProfile = await get().fetchUserProfile(sessionData.user.id);
          console.log('[BOOT] Profile fetched:', userProfile);
        }

      } catch (e: any) {
        // This catch block handles the timeout error or other unexpected errors from Promise.race
        console.error('[BOOT] getSession failed (timeout or other error):', e);
        sessionError = e; // Store the error to be used in finally
        if (typeof window !== 'undefined') {
            toast.error(`Session retrieval failed: ${e.message}`);
        }
      } finally {
        const isAuthenticated = !!(sessionData?.user && userProfile && !sessionError);
        safeSet({
          isLoading: false,
          user: sessionData?.user ?? null,
          profile: isAuthenticated ? userProfile : null, // Only set profile if authenticated
          isAuthenticated: isAuthenticated,
          error: sessionError ? (sessionError.message || 'An unknown error occurred') : null,
        });
        console.log('[BOOT] isLoading → false. isAuthenticated:', isAuthenticated, 'User:', sessionData?.user ?? null, 'Profile:', userProfile, 'Error:', sessionError);
      }
    },

    async login(email, password) {
      try {
        safeSet({ isLoading: true, error: null });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange will handle success
      } catch (err) {
        logDev('login() error:', err);
        safeSet({ error: GENERIC_ERROR, isLoading: false });
        if (typeof window !== 'undefined') {
          toast.error(GENERIC_ERROR);
        }
      }
      // isLoading will be set to false by onAuthStateChange or finally in boot/error
    },

    async signUp(email, password, data = {}) {
      try {
        safeSet({ isLoading: true, error: null });
        const emailRedirectTo = typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

        const { data: signUpResponse, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data,
            emailRedirectTo,
          },
        });
        if (error) throw error;
        if (typeof window !== 'undefined') {
          if (signUpResponse.user && !signUpResponse.user.email_confirmed_at) {
            toast.info('Confirmation email sent. Please check your inbox.');
          } else if (signUpResponse.user) {
            toast.success('Sign up successful!');
          }
        }
        // onAuthStateChange will handle user state
      } catch (err) {
        logDev('signUp() error:', err);
        safeSet({ error: GENERIC_ERROR, isLoading: false });
        if (typeof window !== 'undefined') {
          toast.error(GENERIC_ERROR);
        }
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