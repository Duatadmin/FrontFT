import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/useUserStore';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { 
  User, 
  Settings, 
  Shield, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Award,
  Flame,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Activity,
  Target,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/utils/toast';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0,
    totalExercises: 0,
    memberSince: new Date()
  });

  useEffect(() => {
    if (user) {
      // Fetch user statistics
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
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
      return user.user_metadata.avatar_url;
    }
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10a37f&color=fff&size=128`;
  };

  const formatMemberSince = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  const settingsGroups = [
    {
      title: 'Account Settings',
      items: [
        { icon: User, label: 'Edit Profile', onClick: () => navigate('/settings/profile') },
        { icon: Mail, label: 'Email Preferences', onClick: () => navigate('/settings/email') },
        { icon: Shield, label: 'Privacy & Security', onClick: () => navigate('/settings/privacy') },
        { icon: CreditCard, label: 'Subscription & Billing', onClick: () => navigate('/settings/billing') },
      ]
    },
    {
      title: 'App Settings',
      items: [
        { icon: Bell, label: 'Notifications', onClick: () => navigate('/settings/notifications') },
        { icon: Activity, label: 'Workout Preferences', onClick: () => navigate('/settings/workout') },
        { icon: Target, label: 'Goals & Targets', onClick: () => navigate('/settings/goals') },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', onClick: () => navigate('/help') },
        { icon: Mail, label: 'Contact Support', onClick: () => window.open('mailto:support@jarvis.fitness') },
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <img
                src={getAvatarUrl()}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-accent-lime/20"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-background-primary"></div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {formatMemberSince(stats.memberSince)}
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white/5 backdrop-blur-md border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Workouts</p>
                <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
              </div>
              <Activity className="text-accent-lime" size={32} />
            </div>
          </Card>

          <Card className="p-4 bg-white/5 backdrop-blur-md border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-white">{stats.currentStreak} days</p>
              </div>
              <Flame className="text-orange-500" size={32} />
            </div>
          </Card>

          <Card className="p-4 bg-white/5 backdrop-blur-md border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Exercises Done</p>
                <p className="text-2xl font-bold text-white">{stats.totalExercises}</p>
              </div>
              <TrendingUp className="text-accent-mint" size={32} />
            </div>
          </Card>
        </div>

        {/* Achievements Preview */}
        <Card className="p-6 bg-white/5 backdrop-blur-md border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Achievements</h2>
            <button 
              onClick={() => navigate('/achievements')}
              className="text-accent-lime hover:text-accent-lime/80 text-sm"
            >
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'First Workout', icon: '🏃', earned: true },
              { name: '7 Day Streak', icon: '🔥', earned: true },
              { name: '100 Exercises', icon: '💪', earned: true },
              { name: 'Early Bird', icon: '🌅', earned: false },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg text-center ${
                  achievement.earned 
                    ? 'bg-accent-lime/10 border border-accent-lime/20' 
                    : 'bg-gray-800/50 border border-gray-700 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className="text-sm text-gray-300">{achievement.name}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="p-6 bg-white/5 backdrop-blur-md border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">{group.title}</h2>
            <div className="space-y-1">
              {group.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-gray-400 group-hover:text-accent-lime" />
                    <span className="text-gray-300 group-hover:text-white">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default UserProfile;