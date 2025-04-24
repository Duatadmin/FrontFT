import React, { useEffect } from 'react';
import CurrentPlanCard from '../components/diary/CurrentPlanCard';
import FiltersBar from '../components/diary/FiltersBar';
import WorkoutDisplayCard from '../components/diary/WorkoutDisplayCard';
import SessionDrawer from '../components/diary/SessionDrawer';
import useDiaryStore from '../store/useDiaryStore';
import useUserStore from '../store/useUserStore';
import DashboardBackground from '../components/layout/DashboardBackground';
import Sidebar from '../components/layout/Sidebar';

const DiaryPage: React.FC = () => {
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
    <div className="flex h-screen bg-background text-text-primary">
      {/* Background */}
      <DashboardBackground />
      
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
              <WorkoutDisplayCard />
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
