/**
 * User Store - Manages user authentication and profile
 * 
 * Handles Supabase auth integration with fallback to mock data in development
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '../supabase';
import { toast } from '../utils/toast';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Define the shape of our user object, based on public.users table and auth info
interface AppUser {
  id: string;
  email?: string;
  nickname?: string;
  // Add any other fields from your public.users table you want in the store
}

interface UserState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // True during initial session check and auth operations
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;
  clearError: () => void;
  boot: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get, storeApi) => {
      // Initial state will be defined in the returned object; session initialization is now explicit.

      // Function to fetch user profile from public.users table
      const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<AppUser | null> => {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('users') // Ensure this table name matches your DB
            .select('id') // Select desired fields
            .eq('id', supabaseUser.id)
            .single();

          if (profileError) {
            if (process.env.NODE_ENV === 'development') console.error('Error fetching user profile:', profileError);
            throw new Error(`Failed to fetch profile for user ${supabaseUser.id}: ${profileError.message}`);
          }
          if (!profileData) {
            throw new Error(`No profile data found for user ${supabaseUser.id}`);
          }
          return {
            id: profileData.id,
          };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') console.error('fetchUserProfile error:', error);
          toast.error(error instanceof Error ? error.message : 'Could not load user profile.');
          return null;
        }
      };

      // Handle auth state changes
      supabase.auth.onAuthStateChange(
        async (event, session: Session | null) => {
          if (process.env.NODE_ENV === 'development') console.log(`[UserStore onAuthStateChange event: ${event}]`);

          if (event === 'INITIAL_SESSION') {
            if (process.env.NODE_ENV === 'development') console.log('[UserStore onAuthStateChange] INITIAL_SESSION event received, deferring to internal boot() for session hydration.');
            return; // Explicitly do nothing, as boot() handles initial session loading.
          }

          if (!session || event === 'SIGNED_OUT') {
            if (process.env.NODE_ENV === 'development') console.log('[useUserStore onAuthStateChange] SIGNED_OUT or no session. Setting: {isLoading: false, isAuthenticated: false}');
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
            return;
          }

          if (session.user) {
            const appUser = await fetchUserProfile(session.user);
            if (appUser) {
              if (process.env.NODE_ENV === 'development') console.log('[useUserStore onAuthStateChange] User profile fetched. Setting: {isLoading: false, isAuthenticated: true}', appUser);
              set({ user: appUser, isAuthenticated: true, isLoading: false, error: null });
            } else {
              if (process.env.NODE_ENV === 'development') console.log('[useUserStore onAuthStateChange] Failed to fetch profile. Setting: {isLoading: false, isAuthenticated: false}');
              set({ user: null, isAuthenticated: false, isLoading: false, error: 'Failed to load user profile during auth state change.' });
              supabase.auth.signOut(); // Non-awaited, let onAuthStateChange handle the SIGNED_OUT event
            }
          } else {
            if (process.env.NODE_ENV === 'development') console.log('[useUserStore onAuthStateChange] Session present but no user. Setting: {isLoading: false, isAuthenticated: false}');
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
          }
        }
      );

      const initialStateAndMethods = {
        user: null,
        isAuthenticated: false,
        isLoading: true, // Initial state; boot will set to false
        error: null,

        boot: async () => {
          if (process.env.NODE_ENV === 'development') console.time('[UserStore boot]');
          if (process.env.NODE_ENV === 'development') console.log('[UserStore boot] Setting isLoading: true');
          set({ isLoading: true, error: null });
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            if (session && session.user) {
              const appUser = await fetchUserProfile(session.user);
              if (appUser) {
                if (process.env.NODE_ENV === 'development') console.log('[UserStore boot] User profile fetched. Setting state.');
                set({ user: appUser, isAuthenticated: true, error: null });
              } else {
                if (process.env.NODE_ENV === 'development') console.log('[UserStore boot] Failed to fetch profile. Signing out.');
                set({ user: null, isAuthenticated: false, error: 'Failed to load user profile on initial check.' });
                // Don't await signOut here to prevent potential deadlocks if onAuthStateChange is also trying to act
                supabase.auth.signOut(); 
              }
            } else {
              if (process.env.NODE_ENV === 'development') console.log('[UserStore boot] No initial session.');
              set({ user: null, isAuthenticated: false, error: null });
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('[UserStore boot] Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error checking initial session.';
            set({ user: null, isAuthenticated: false, error: errorMessage });
          } finally {
            if (process.env.NODE_ENV === 'development') console.log('[UserStore boot] Setting isLoading: false (finally)');
            set({ isLoading: false });
            if (process.env.NODE_ENV === 'development') console.timeEnd('[UserStore boot]');
          }
        },

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed.';
            if (process.env.NODE_ENV === 'development') console.error('Login error:', errorMessage);
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        signUp: async (email: string, password: string, nickname: string) => {
          set({ isLoading: true, error: null });
          try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { nickname }
              }
            });

            if (signUpError) throw signUpError;

            // Successfully initiated sign-up (user might need to confirm email)
            // Set isLoading to false here as the signUp API call itself is done.
            // onAuthStateChange will handle the actual session establishment later.
            set({ isLoading: false });
            
            if (signUpData.user && !signUpData.user.email_confirmed_at) {
              toast.info('Confirmation email sent. Please check your inbox.');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Signup failed.';
            if (process.env.NODE_ENV === 'development') console.error('Signup error:', errorMessage);
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        logout: async () => {
          set({ isLoading: true, error: null });
          try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            // onAuthStateChange will set user to null and isAuthenticated to false
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Logout failed.';
            if (process.env.NODE_ENV === 'development') console.error('Logout error:', errorMessage);
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        resetPassword: async (email: string) => {
          set({ isLoading: true, error: null });
          try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/update-password`, // Ensure this route exists or adjust as needed
            });
            if (error) throw error;
            toast.success('Password reset email sent. Please check your inbox.');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password reset failed.';
            if (process.env.NODE_ENV === 'development') console.error('Password reset error:', errorMessage);
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          } finally {
            set({ isLoading: false });
          }
        },

        updateProfile: async (updates: Partial<AppUser>) => {
          set({ isLoading: true, error: null });
          const currentUser = get().user; // get() gives access to the store's state
          
          if (!currentUser?.id) {
            const err = 'User not authenticated or ID missing. Cannot update profile.';
            set({ error: err, isLoading: false });
            toast.error(err);
            return;
          }

          try {
            // Prepare updates, ensuring we only send fields relevant to AppUser and 'users' table
            // For example, if AppUser could have more fields than 'users' table, filter them here.
            // Supabase update will ignore columns that don't exist, but it's cleaner to be explicit.
            const profileUpdates: Partial<AppUser> = {};
            if (updates.nickname !== undefined) profileUpdates.nickname = updates.nickname;
            // Add other updatable fields from AppUser here, e.g., email if your policy allows
            // if (updates.email !== undefined) profileUpdates.email = updates.email;

            if (Object.keys(profileUpdates).length === 0) {
              toast.info('No profile changes to apply.');
              set({ isLoading: false });
              return;
            }

            const { data, error: updateError } = await supabase
              .from('users')
              .update(profileUpdates) 
              .eq('id', currentUser.id)
              .select('id') // Reselect fields defined in AppUser
              .single();

            if (updateError) throw updateError;

            if (data) {
              set((state) => ({ 
                user: state.user ? { ...state.user, ...data } : data, 
                isLoading: false 
              }));
              toast.success('Profile updated successfully!');
            } else {
              throw new Error('Profile update failed - no data returned from Supabase');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Profile update failed.';
            if (process.env.NODE_ENV === 'development') console.error('Profile update error:', errorMessage);
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        clearError: () => {
          set({ error: null });
        },

      }; // Closes initialStateAndMethods

      // Auto-initialize session on store creation
      if (typeof storeApi.getState().boot === 'function') {
        storeApi.getState().boot();
      } else if (process.env.NODE_ENV === 'development') {
        console.error('[UserStore setup] boot() method not found on storeApi.getState(). Auto-hydration will not occur.');
      }
      return initialStateAndMethods;
    },
    { name: 'user-store', // Name for Redux DevTools
    }
  )
);

// Export selectors/hooks
export const useCurrentUser   = () => useUserStore(s => s.user);
export const useAuthLoading   = () => useUserStore(s => s.isLoading);
export const useAuthenticated = () => useUserStore(s => s.isAuthenticated);

