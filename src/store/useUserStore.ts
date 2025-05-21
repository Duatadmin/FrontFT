import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  nickname: string;
  created_at: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => User | null;
}

const userStoreCreator: StateCreator<UserState> = (set, get) => ({
      user: {
        id: 'mock-user-id',
        nickname: 'FitUser',
        created_at: new Date().toISOString()
      }, // Mock user for development
      isAuthenticated: true, // For development purposes
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock login - in a real app, this would call Supabase auth
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
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          });
        }
      },
      
      logout: () => {
        // Mock logout
        set({
          user: null,
          isAuthenticated: false
        });
      },
      
      getCurrentUser: (): User | null => {
        return get().user;
      }
    });

const useUserStore = create<UserState>()(
  devtools(userStoreCreator, { name: 'user-store' })
);

export default useUserStore;
