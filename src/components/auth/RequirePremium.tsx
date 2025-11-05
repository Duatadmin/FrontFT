import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/stores/useUserStore';

interface RequirePremiumProps {
  children: ReactNode;
}

export default function RequirePremium({ children }: RequirePremiumProps) {
  const { user, isAuthenticated } = useUserStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is banned
  const bannedUntil = (user.user_metadata as any)?.banned_until;
  const banned = bannedUntil && new Date(bannedUntil) > new Date();

  // If banned, redirect to login (which will handle Stripe checkout)
  if (banned) {
    return <Navigate to="/login" replace />;
  }

  // User has premium access, render children
  return <>{children}</>;
}