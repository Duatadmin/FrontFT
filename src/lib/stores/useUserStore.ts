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
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => {
      // Initial state
      set({ isLoading: true }); // Start loading until session is checked

      // Function to fetch user profile from public.users table
      const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<AppUser | null> => {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('users') // Ensure this table name matches your DB
            .select('id') // Select desired fields
            .eq('id', supabaseUser.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            // If profile doesn't exist, it might be a new signup, handle accordingly or error out
            // For now, we'll assume a profile should exist if a session does.
            throw new Error(`Failed to fetch profile for user ${supabaseUser.id}: ${profileError.message}`);
          }
          if (!profileData) {
            throw new Error(`No profile data found for user ${supabaseUser.id}`);
          }
          return {
            id: profileData.id,
          };
        } catch (error) {
          console.error('fetchUserProfile error:', error);
          toast.error(error instanceof Error ? error.message : 'Could not load user profile.');
          // Critical error, potentially sign out user if profile is essential
          // await supabase.auth.signOut(); 
          return null;
        }
      };

      // Handle auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session: Session | null) => {
          set({ isLoading: true, error: null });
          if (event === 'INITIAL_SESSION') {
            // Handled by getSession below, but good to be aware of
          }

          if (!session || event === 'SIGNED_OUT') {
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
            return;
          }

          // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED
          if (session.user) {
            const appUser = await fetchUserProfile(session.user);
            if (appUser) {
              set({ user: appUser, isAuthenticated: true, isLoading: false, error: null });
            } else {
              // Failed to get profile, treat as unauthenticated or error state
              set({ user: null, isAuthenticated: false, isLoading: false, error: 'Failed to load user profile.' });
              // Optionally sign out to clear inconsistent Supabase session
              await supabase.auth.signOut();
            }
          } else {
            // Should not happen if session is present, but as a safeguard
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
          }
        }
      );
      
      // Check initial session state
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        set({ isLoading: true, error: null });
        if (session && session.user) {
          const appUser = await fetchUserProfile(session.user);
          if (appUser) {
            set({ user: appUser, isAuthenticated: true, isLoading: false, error: null });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false, error: 'Failed to load user profile on initial check.' });
            await supabase.auth.signOut(); // Clear potentially problematic session
          }
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      }).catch(error => {
        console.error('Error in initial getSession:', error);
        set({ user: null, isAuthenticated: false, isLoading: false, error: 'Error checking initial session.' });
      });

      // Handle HMR for the subscription
      if (import.meta.hot) {
        import.meta.hot.dispose(() => {
          subscription?.unsubscribe();
        });
      }

      return {
        user: null,
        isAuthenticated: false,
        isLoading: true, // Will be set to false after initial check
        error: null,

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // onAuthStateChange will handle setting user and isAuthenticated
            // toast.success will be handled based on user profile load if desired
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed.';
            console.error('Login error:', errorMessage);
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        signUp: async (email, password, nickname) => {
          set({ isLoading: true, error: null });
          try {
            // Supabase handles creating the auth.user and then the trigger/function creates public.users row
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                // Pass nickname here if your Supabase setup (e.g., a function hook on auth.users insert)
                // uses it to populate the public.users table immediately.
                // Otherwise, the profile might be created by a trigger or manually after email confirmation.
                // For simplicity, we assume a trigger handles public.users creation based on auth.users.
                // If you need to pass `nickname` to be stored in `auth.users.raw_user_meta_data`
                // and then a trigger reads it, that's a common pattern.
                data: { nickname } // This stores it in raw_user_meta_data by default
              }
            });

            if (signUpError) throw signUpError;
            
            // After successful Supabase auth.signUp, onAuthStateChange will be triggered.
            // If email confirmation is required, user won't be fully 'SIGNED_IN' until confirmed.
            // The public.users table entry is typically created by a DB trigger on auth.users insert.
            // If not, you might need to insert into public.users here, but that's less common with modern Supabase setups.
            // We rely on onAuthStateChange to fetch the profile once the user is effectively signed in.

            if (signUpData.user && !signUpData.user.email_confirmed_at) {
              toast.info('Confirmation email sent. Please check your inbox.');
            }
            // If auto-confirm is on, or after confirmation, onAuthStateChange will set the user.

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Signup failed.';
            console.error('Signup error:', errorMessage);
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
            console.error('Logout error:', errorMessage);
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
            console.error('Password reset error:', errorMessage);
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
            console.error('Profile update error:', errorMessage);
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
          }
        },

        clearError: () => {
          set({ error: null });
        },

      }; // Closes the object returned by (set, get) => ({...})
    },
    { name: 'UserStore' } // devtools name
  )
);

// Export selectors/hooks
export const useCurrentUser   = () => useUserStore(s => s.user);
export const useAuthLoading   = () => useUserStore(s => s.isLoading);
export const useAuthenticated = () => useUserStore(s => s.isAuthenticated);

// Hook for requiring authentication on a page/component
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRequireAuth = () => {
  const isAuthenticated = useAuthenticated();
  const isLoading = useAuthLoading();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated.
    // This prevents redirecting before the auth state is determined.
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Optionally, return loading and auth state if components need to react to them
  // For example, to show a spinner while loading auth state before redirecting.
  return { isLoading, isAuthenticated };
};

