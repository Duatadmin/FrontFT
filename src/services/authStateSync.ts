import { supabase } from '@/lib/supabase';

import { useProgramStore } from '@/lib/stores/useProgramStore';
import useDiaryStore from '@/store/useDiaryStore';

/**
 * Service to sync Zustand stores with auth state changes.
 * This ensures that stores refetch data when tokens are refreshed.
 */
export class AuthStateSync {
  private static instance: AuthStateSync;
  private unsubscribe: (() => void) | null = null;
  private isRefetching = false;
  private lastRefetchAt = 0;

  private constructor() {}

  static getInstance(): AuthStateSync {
    if (!AuthStateSync.instance) {
      AuthStateSync.instance = new AuthStateSync();
    }
    return AuthStateSync.instance;
  }

  /**
   * Start listening to auth state changes and sync stores
   */
  start(): void {
    if (this.unsubscribe) {
      console.warn('[AuthStateSync] Already started, skipping...');
      return;
    }

    console.log('[AuthStateSync] Starting auth state synchronization...');

    const { data: authListener } = supabase.auth.onAuthStateChange((event, _session) => {
      console.log('[AuthStateSync] Auth event:', event);

      switch (event) {
        case 'TOKEN_REFRESHED':
          // Only refetch on token refresh, not on initial sign in
          console.log('[AuthStateSync] Token refreshed, scheduling store refetch after readiness...');
          // Throttle duplicate refresh bursts
          if (Date.now() - this.lastRefetchAt < 3000) {
            console.log('[AuthStateSync] Skipping refetch (throttled)');
            return;
          }
          // Add a small delay to let the new token propagate, then wait for readiness
          setTimeout(async () => {
            if (this.isRefetching) {
              console.warn('[AuthStateSync] Refetch already in progress, skipping');
              return;
            }
            this.isRefetching = true;
            try {
              // Wait a bit for token to propagate then refetch stores
              await this.refetchAllStores();
            } catch (e) {
              console.warn('[AuthStateSync] Refetch after token refresh encountered an error:', e);
            } finally {
              this.isRefetching = false;
              this.lastRefetchAt = Date.now();
            }
          }, 300);
          break;

        case 'SIGNED_OUT':
          // Clear store data
          this.clearAllStores();
          break;
        // Don't refetch on SIGNED_IN as it happens during initialization
        // and the stores will fetch their own data
      }
    });

    this.unsubscribe = () => {
      authListener?.subscription.unsubscribe();
    };
  }

  /**
   * Stop listening to auth state changes
   */
  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      console.log('[AuthStateSync] Stopped auth state synchronization');
    }
  }

  /**
   * Refetch data in all Zustand stores
   */
  private async refetchAllStores(): Promise<void> {
    console.log('[AuthStateSync] Refetching data in all stores...');

    try {
      // Refetch program store data
      const programStore = useProgramStore.getState();
      await Promise.all([
        programStore.fetchCurrentPlan()
        // Skip fetchGoals as the goals table doesn't exist
      ]);

      // Refetch diary store data if user is authenticated
      const diaryStore = useDiaryStore.getState();
      const { getCurrentUserId } = await import('@/lib/supabase');
      const userId = await getCurrentUserId();
      
      if (userId) {
        await Promise.all([
          diaryStore.fetchGoals(userId),
          diaryStore.fetchCurrentWeekReflection(userId),
          diaryStore.fetchProgressPhotos(userId),
          diaryStore.calculateStreak()
        ]);
      }

      console.log('[AuthStateSync] Successfully refetched all store data');
    } catch (error) {
      console.error('[AuthStateSync] Error refetching store data:', error);
    }
  }

  /**
   * Clear data in all stores on sign out
   */
  private clearAllStores(): void {
    console.log('[AuthStateSync] Clearing all store data...');

    // Clear program store
    useProgramStore.setState({
      currentPlan: null,
      goals: [],
      error: null,
      goalsError: null
    });

    // Clear diary store
    useDiaryStore.setState({
      sessions: [],
      currentPlan: null,
      todayWorkout: null,
      goals: [],
      weeklyReflections: [],
      currentWeekReflection: null,
      progressPhotos: [],
      streak: { currentStreak: 0, longestStreak: 0, lastSevenDays: Array(7).fill(false), streakChange: 0 },
      selectedSession: null,
      error: {}
    });

    console.log('[AuthStateSync] Cleared all store data');
  }
}

// Export singleton instance
export const authStateSync = AuthStateSync.getInstance();