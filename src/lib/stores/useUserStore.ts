/**
 * User Store - Manages user authentication and profile
 * 
 * Handles Supabase auth integration with fallback to mock data in development
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '../supabase';
import { User } from '../supabase/schema.types';
import { toast } from '../utils/toast';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // Helpers
  getCurrentUser: () => User | null;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: import.meta.env.DEV 
          ? {
              id: '792ee0b8-5ba2-40a5-8f35-ab1bff798908',
              nickname: 'TestUser',
              created_at: new Date().toISOString()
            } 
          : null,
        isAuthenticated: import.meta.env.DEV ? true : false,
        isLoading: false,
        error: null,
        
        // Login with email and password
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          
          try {
            // In development mode, use mock login
            if (import.meta.env.DEV && email.includes('mock')) {
              await new Promise(resolve => setTimeout(resolve, 800));
              
              set({
                user: {
                  id: 'mock-user-id',
                  nickname: 'FitUser',
                  created_at: new Date().toISOString()
                },
                isAuthenticated: true,
                isLoading: false
              });
              
              toast.success('Welcome back, FitUser!');
              return;
            }
            
            // Real Supabase auth
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (error) throw error;
            
            if (data.user) {
              // Fetch user profile data
              const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();
              
              if (profileError) throw profileError;
              
              set({
                user: profileData,
                isAuthenticated: true,
                isLoading: false
              });
              
              toast.success(`Welcome back, ${profileData.nickname || 'Athlete'}!`);
            } else {
              throw new Error('Login failed - no user returned');
            }
          } catch (error) {
            console.error('Login error:', error);
            
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Login failed. Please check your credentials.';
            
            set({
              error: errorMessage,
              isLoading: false
            });
            
            toast.error(errorMessage);
          }
        },
        
        // Sign up new user
        signUp: async (email, password, nickname) => {
          set({ isLoading: true, error: null });
          
          try {
            // In development mode, use mock signup
            if (import.meta.env.DEV && email.includes('mock')) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const mockUser = {
                id: `mock-user-${Date.now()}`,
                nickname,
                created_at: new Date().toISOString()
              };
              
              set({
                user: mockUser,
                isAuthenticated: true,
                isLoading: false
              });
              
              toast.success('Account created successfully!');
              return;
            }
            
            // Real Supabase signup
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  nickname
                }
              }
            });
            
            if (error) throw error;
            
            if (data.user) {
              // Create profile record
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  nickname,
                  email
                });
              
              if (profileError) throw profileError;
              
              const newUser = {
                id: data.user.id,
                nickname,
                created_at: new Date().toISOString()
              };
              
              set({
                user: newUser,
                isAuthenticated: true,
                isLoading: false
              });
              
              toast.success('Account created successfully!');
            } else {
              throw new Error('Signup failed - no user returned');
            }
          } catch (error) {
            console.error('Signup error:', error);
            
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Signup failed. Please try again.';
            
            set({
              error: errorMessage,
              isLoading: false
            });
            
            toast.error(errorMessage);
          }
        },
        
        // Logout user
        logout: async () => {
          set({ isLoading: true });
          
          try {
            // In development mode, use mock logout
            if (import.meta.env.DEV) {
              await new Promise(resolve => setTimeout(resolve, 500));
              
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false
              });
              
              toast.info('You have been logged out.');
              return;
            }
            
            // Real Supabase logout
            const { error } = await supabase.auth.signOut();
            
            if (error) throw error;
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
            
            toast.info('You have been logged out.');
          } catch (error) {
            console.error('Logout error:', error);
            
            set({
              error: error instanceof Error ? error.message : 'Logout failed',
              isLoading: false
            });
          }
        },
        
        // Reset password
        resetPassword: async (email) => {
          set({ isLoading: true, error: null });
          
          try {
            // In development mode, use mock reset
            if (import.meta.env.DEV) {
              await new Promise(resolve => setTimeout(resolve, 800));
              
              set({ isLoading: false });
              
              toast.success('If your email exists in our system, you will receive a password reset link.');
              return;
            }
            
            // Real Supabase password reset
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            
            if (error) throw error;
            
            set({ isLoading: false });
            
            toast.success('If your email exists in our system, you will receive a password reset link.');
          } catch (error) {
            console.error('Password reset error:', error);
            
            set({
              error: error instanceof Error ? error.message : 'Password reset failed',
              isLoading: false
            });
            
            toast.error('Failed to send password reset email. Please try again.');
          }
        },
        
        // Update user profile
        updateProfile: async (updates) => {
          set({ isLoading: true, error: null });
          
          try {
            const currentUser = get().user;
            
            if (!currentUser) {
              throw new Error('No authenticated user');
            }
            
            // In development mode, use mock update
            if (import.meta.env.DEV) {
              await new Promise(resolve => setTimeout(resolve, 800));
              
              set({
                user: { ...currentUser, ...updates },
                isLoading: false
              });
              
              toast.success('Profile updated successfully!');
              return;
            }
            
            // Real Supabase profile update
            const { error } = await supabase
              .from('users')
              .update(updates)
              .eq('id', currentUser.id);
            
            if (error) throw error;
            
            set({
              user: { ...currentUser, ...updates },
              isLoading: false
            });
            
            toast.success('Profile updated successfully!');
          } catch (error) {
            console.error('Profile update error:', error);
            
            set({
              error: error instanceof Error ? error.message : 'Profile update failed',
              isLoading: false
            });
            
            toast.error('Failed to update profile. Please try again.');
          }
        },
        
        // Get current user
        getCurrentUser: () => {
          return get().user;
        },
        
        // Clear error state
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'user-store' }
  )
);

export default useUserStore;
