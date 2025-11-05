import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type SubscriptionStatus = 'idle' | 'loading' | 'active' | 'inactive' | 'error';

interface SubscriptionStore {
  // State
  status: SubscriptionStatus;
  error: string | null;
  lastChecked: number | null;
  
  // Actions
  setStatus: (status: SubscriptionStatus) => void;
  setError: (error: string | null) => void;
  setLastChecked: (timestamp: number) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as SubscriptionStatus,
  error: null,
  lastChecked: null,
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setStatus: (status) => 
        set(
          { status, error: status === 'error' ? 'Subscription check failed' : null },
          false,
          'setStatus'
        ),
      
      setError: (error) => 
        set(
          { error, status: error ? 'error' : 'idle' },
          false,
          'setError'
        ),
      
      setLastChecked: (timestamp) => 
        set(
          { lastChecked: timestamp },
          false,
          'setLastChecked'
        ),
      
      reset: () => 
        set(
          initialState,
          false,
          'reset'
        ),
    }),
    { name: 'subscription-store' }
  )
);

// Helper selectors
export const selectIsActive = (state: SubscriptionStore) => state.status === 'active';
export const selectIsLoading = (state: SubscriptionStore) => state.status === 'loading';
export const selectHasError = (state: SubscriptionStore) => state.status === 'error';