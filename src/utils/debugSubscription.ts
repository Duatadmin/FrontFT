/**
 * Debug utilities for subscription and authentication issues
 * Run these in browser console to diagnose problems
 */

import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/stores/useUserStore';

export const debugSubscription = {
  /**
   * Check current authentication status
   */
  async checkAuth() {
    console.log('=== AUTH STATUS CHECK ===');
    
    // Check session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session?.session ? 'Valid' : 'Invalid');
    if (sessionError) console.error('Session error:', sessionError);
    
    if (session?.session) {
      console.log('User ID:', session.session.user.id);
      console.log('Email:', session.session.user.email);
      console.log('Token expires at:', new Date(session.session.expires_at! * 1000).toISOString());
      
      // Check if token is expired
      const now = Date.now() / 1000;
      const expiresIn = session.session.expires_at! - now;
      if (expiresIn < 0) {
        console.error('TOKEN EXPIRED!');
      } else {
        console.log('Token expires in:', Math.round(expiresIn / 60), 'minutes');
      }
    }
    
    // Check store
    const store = useUserStore.getState();
    console.log('Store user:', store.user?.id);
    console.log('Store authenticated:', store.isAuthenticated);
    
    return session?.session;
  },

  /**
   * Force refresh session
   */
  async refreshSession() {
    console.log('=== REFRESHING SESSION ===');
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Refresh failed:', error);
      return null;
    }
    console.log('Session refreshed successfully');
    return data.session;
  },

  /**
   * Check subscription status (bypassing cache)
   */
  async checkSubscription() {
    console.log('=== SUBSCRIPTION CHECK ===');
    
    // Get user
    const store = useUserStore.getState();
    const user = store.user;
    
    if (!user) {
      console.error('No user in store');
      return null;
    }
    
    // Check v_active_users view directly
    const { data, error } = await supabase
      .from('v_active_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking subscription:', error);
      return { isActive: false, error: error.message };
    }
    
    const isActive = !!data;
    console.log('Subscription status:', { isActive, userId: user.id });
    
    return { isActive };
  },

  /**
   * Test data fetching
   */
  async testDataFetch() {
    console.log('=== TESTING DATA FETCH ===');
    
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.error('No valid session');
      return;
    }
    
    const userId = session.session.user.id;
    console.log('Testing with userId:', userId);
    
    // Test fetching from v_active_users
    console.log('Testing v_active_users view...');
    const { data: activeUsers, error: activeError } = await supabase
      .from('v_active_users')
      .select('*')
      .eq('user_id', userId);
    
    if (activeError) {
      console.error('v_active_users error:', activeError);
    } else {
      console.log('v_active_users result:', activeUsers);
    }
    
    // Test fetching from workout_full_view
    console.log('Testing workout_full_view...');
    const { data: workouts, error: workoutError } = await supabase
      .from('workout_full_view')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    
    if (workoutError) {
      console.error('workout_full_view error:', workoutError);
    } else {
      console.log('workout_full_view result:', workouts);
    }
    
    // Test fetching from workout_sessions
    console.log('Testing workout_sessions...');
    const { data: sessions, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    
    if (sessionError) {
      console.error('workout_sessions error:', sessionError);
    } else {
      console.log('workout_sessions result:', sessions);
    }
  },

  /**
   * Full diagnostic
   */
  async fullDiagnostic() {
    console.log('=== FULL DIAGNOSTIC STARTING ===\n');
    
    await this.checkAuth();
    console.log('\n');
    
    await this.checkSubscription();
    console.log('\n');
    
    await this.testDataFetch();
    console.log('\n');
    
    console.log('=== DIAGNOSTIC COMPLETE ===');
    console.log('Check the console output above for issues');
  },

  /**
   * Clear all caches and force reload
   */
  clearAndReload() {
    console.log('Clearing all caches...');
    sessionStorage.clear();
    localStorage.removeItem('supabase.auth.token');
    console.log('Caches cleared. Reloading page...');
    window.location.reload();
  }
};

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).debugSubscription = debugSubscription;
  console.log('[Debug] Subscription debug tools loaded. Use window.debugSubscription.fullDiagnostic()');
}