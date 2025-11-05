import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/useUserStore';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Award,
  Flame,
  Mail,
  Activity,
  Target,
  TrendingUp,
  Edit3,
  Camera,
  Crown,
  Trophy,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/utils/toast';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { useSubscription } from '@/hooks/useSubscription';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { isActive: hasSubscription, refetch: refetchSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0,
    totalExercises: 0,
    memberSince: new Date()
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const formatNumber = (n: number) => new Intl.NumberFormat(locale).format(n);

  useEffect(() => {
    if (user) {
      // Fetch user statistics
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      // This would fetch real data from your API/Supabase
      // For now, using mock data
      setStats({
        totalWorkouts: 156,
        currentStreak: 7,
        totalExercises: 1243,
        memberSince: new Date(user?.created_at || Date.now())
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error('Please log in to manage subscription');
      return;
    }

    setCheckingSubscription(true);
    try {
      // Create a portal session to manage subscription
      const result = await SubscriptionService.createPortalSession(user);
      
      if (result.needsSubscription) {
        // User doesn't have a subscription, redirect to checkout
        toast.info('No subscription found', {
          description: 'Redirecting to subscription page...'
        });
        // You can redirect to your subscription/pricing page here
        navigate('/pricing');
        return;
      }
      
      if (result.error) {
        toast.error('Failed to open subscription management', {
          description: result.error
        });
        return;
      }
      
      if (result.url) {
        // Redirect to Stripe Customer Portal
        await SubscriptionService.redirectToPortal(result.url);
      }
    } catch (error: any) {
      console.error('Portal session error:', error);
      toast.error('Failed to open subscription management', {
        description: error.message || 'Please try again later.'
      });
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url as string;
    }
    return null;
  };

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const parts = name.trim().split(/\s+/);
    const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : `${parts[0][0]}`;
    return initials.toUpperCase();
  };

  const formatMemberSince = (date: Date) => {
    return new Intl.DateTimeFormat(locale, { 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  const settingsGroups = [
    {
      title: 'Account Settings',
      items: [
        { icon: User, label: 'Edit Profile', to: '/settings/profile' },
        { icon: Mail, label: 'Email Preferences', to: '/settings/email' },
        { icon: Shield, label: 'Privacy & Security', to: '/settings/privacy' },
        { icon: CreditCard, label: 'Subscription & Billing', to: '/settings/billing' },
      ]
    },
    {
      title: 'App Settings',
      items: [
        { icon: Bell, label: 'Notifications', to: '/settings/notifications' },
        { icon: Activity, label: 'Workout Preferences', to: '/settings/workout' },
        { icon: Target, label: 'Goals & Targets', to: '/settings/goals' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', to: '/help' },
        { icon: Mail, label: 'Contact Support', href: 'mailto:support@jarvis.fitness' },
      ]
    }
  ];

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Please log in to view your profile</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Profile Header */}
        <Card className="relative overflow-hidden p-6 sm:p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent-lime/20 blur-3xl rounded-full" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full" aria-hidden="true" />
          </div>

          <div className="relative flex flex-col md:flex-row md:items-end items-center gap-6">
            <div className="relative">
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl() as string}
                  alt={displayName}
                  width={112}
                  height={112}
                  loading="eager"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-white/10 shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-white/10 shadow-lg bg-gradient-to-br from-accent-lime/30 to-accent-mint/30 flex items-center justify-center text-white text-2xl font-semibold">
                  {getInitials()}
                </div>
              )}

              <button
                type="button"
                aria-label="Change profile photo"
                className="absolute -bottom-2 -right-2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime"
              >
                <Camera size={16} aria-hidden="true" />
              </button>

              <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-green-500 ring-2 ring-background-primary" aria-hidden="true" />
              <span className="sr-only">Status: Online</span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{displayName}</h1>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-400 mt-1">Member since {formatMemberSince(stats.memberSince)}</p>

              <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                <Link
                  to="/settings/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-lime/20 text-accent-lime hover:bg-accent-lime/30 border border-accent-lime/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime"
                >
                  <Edit3 size={16} aria-hidden="true" />
                  <span>Edit profile</span>
                </Link>
                <button
                  onClick={handleManageSubscription}
                  disabled={checkingSubscription}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {checkingSubscription ? (
                    <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <CreditCard size={16} aria-hidden="true" />
                      {hasSubscription && (
                        <CheckCircle size={14} className="text-green-400" aria-hidden="true" />
                      )}
                    </>
                  )}
                  <span>{checkingSubscription ? 'Loading...' : 'Manage Subscription'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="self-end md:self-auto order-first md:order-last inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-400/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <LogOut size={16} aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Streak Progress */}
          <Card className="p-5 bg-white/5 backdrop-blur-md border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                {/* Progress Ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#fb923c ${Math.min((stats.currentStreak / 30) * 100, 100)}%, rgba(255,255,255,0.08) 0)`
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-1.5 rounded-full bg-background-primary border border-white/10" aria-hidden="true" />
                <div className="relative z-[1] w-full h-full flex items-center justify-center">
                  {statsLoading ? (
                    <div className="h-4 w-10 bg-white/10 rounded animate-pulse" />
                  ) : (
                    <span className="text-white font-semibold">{stats.currentStreak}d</span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Current Streak</p>
                <div className="flex items-center gap-2">
                  {statsLoading ? (
                    <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                  ) : (
                    <p className="text-xl font-bold text-white">{stats.currentStreak} days</p>
                  )}
                  <Flame className="text-orange-400" size={18} aria-hidden="true" />
                </div>
                <p className="text-xs text-gray-500 mt-1">30-day milestone target</p>
              </div>
            </div>
          </Card>

          {/* Total Workouts */}
          <Card className="p-5 bg-white/5 backdrop-blur-md border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Workouts</p>
                {statsLoading ? (
                  <div className="h-7 w-20 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">{formatNumber(stats.totalWorkouts)}</p>
                )}
              </div>
              <Activity className="text-accent-lime" size={32} aria-hidden="true" />
            </div>
          </Card>

          {/* Exercises Done */}
          <Card className="p-5 bg-white/5 backdrop-blur-md border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Exercises Done</p>
                {statsLoading ? (
                  <div className="h-7 w-20 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">{formatNumber(stats.totalExercises)}</p>
                )}
              </div>
              <TrendingUp className="text-accent-mint" size={32} aria-hidden="true" />
            </div>
          </Card>

          {/* Member Since */}
          <Card className="p-5 bg-white/5 backdrop-blur-md border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Member Since</p>
                {statsLoading ? (
                  <div className="h-7 w-28 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">{formatMemberSince(stats.memberSince)}</p>
                )}
              </div>
              <Crown className="text-yellow-400" size={28} aria-hidden="true" />
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Achievements</h2>
            <Link to="/achievements" className="text-accent-lime hover:text-accent-lime/80 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime rounded">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'First Workout', icon: Award, earned: true },
              { name: '7 Day Streak', icon: Flame, earned: true },
              { name: '100 Exercises', icon: Trophy, earned: true },
              { name: 'Early Bird', icon: Award, earned: false },
              { name: 'Consistency', icon: Target, earned: false },
              { name: 'Momentum', icon: Activity, earned: true },
            ].map((achievement, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border text-center ${
                  achievement.earned
                    ? 'bg-accent-lime/10 border-accent-lime/20'
                    : 'bg-white/5 border-white/10 opacity-80'
                }`}
              >
                <div className="flex items-center justify-center h-10 mb-2">
                  <achievement.icon
                    size={24}
                    className={achievement.earned ? 'text-accent-lime' : 'text-gray-400'}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm text-gray-300">{achievement.name}</p>
                {!achievement.earned && (
                  <p className="text-[11px] text-gray-500 mt-1">Keep going to unlock</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Settings */}
        {settingsGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="p-6 bg-white/5 backdrop-blur-md border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">{group.title}</h2>
            <ul className="space-y-1">
              {group.items.map((item: any, itemIndex: number) => {
                const Content = (
                  <div className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime">
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="text-gray-400 group-hover:text-accent-lime" aria-hidden="true" />
                      <span className="text-gray-300 group-hover:text-white">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" aria-hidden="true" />
                  </div>
                );

                return (
                  <li key={itemIndex}>
                    {item.to ? (
                      <Link to={item.to} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime">
                        {Content}
                      </Link>
                    ) : item.href ? (
                      <a href={item.href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime">
                        {Content}
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default UserProfile;