import React, { useEffect } from 'react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import CurrentPlanCard from '../components/diary/CurrentPlanCard';
import FiltersBar from '../components/diary/FiltersBar';
import SessionDrawer from '../components/diary/SessionDrawer';
import useDiaryStore from '../store/useDiaryStore';
import useUserStore from '../store/useUserStore';
import Sidebar from '../components/layout/Sidebar';

const DiaryPage: React.FC = () => {
  useAuthGuard();
  const { fetchSessions, fetchCurrentPlan } = useDiaryStore();
  const { user } = useUserStore();
  
  // Fetch data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchSessions(user.id);
      fetchCurrentPlan(user.id);
    }
  }, [user, fetchSessions, fetchCurrentPlan]);
  
  return (
    <div className="flex h-screen text-text-primary">
      {/* Global DashboardBackground from main.tsx will now be visible */}
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="container mx-auto px-4 py-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">Training Diary</h1>
            <p className="text-text-secondary">Track and review your workouts</p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Current plan card */}
            <div className="lg:col-span-4">
              <CurrentPlanCard />
            </div>
            
            {/* Workout history */}
            <div className="lg:col-span-8 flex flex-col">
              <FiltersBar />
            </div>
          </div>
        </main>
      </div>
      
      {/* Session drawer */}
      <SessionDrawer />
    </div>
  );
};

export default DiaryPage;
