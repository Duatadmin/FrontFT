import React, { useEffect } from 'react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import Sidebar from '../components/layout/Sidebar';
import useDiaryStore from '../store/useDiaryStore';
import useUserStore from '../store/useUserStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { CalendarDays, BarChart2, Target } from 'lucide-react';

// Tab content (lazy-loaded)
import DailyLogTab from '../components/diary/tabs/DailyLogTab';
import WeeklyReviewTab from '../components/diary/tabs/WeeklyReviewTab';
import GoalsReflectionsTab from '../components/diary/tabs/GoalsReflectionsTab';

/**
 * Enhanced Training Journal Page
 * Manages multiple sections of the training diary through a tabbed interface
 */
const EnhancedDiaryPage: React.FC = () => {
  useAuthGuard();
  const { 
    activeTab, 
    setActiveTab, 
    fetchSessions, 
    fetchCurrentPlan,
    fetchGoals,
    fetchCurrentWeekReflection,
    fetchProgressPhotos,
    calculateStreak
  } = useDiaryStore();
  
  const { user } = useUserStore();
  
  // Fetch data on component mount
  useEffect(() => {
    if (user?.id) {
      // Fetch core diary data
      fetchSessions(user.id);
      fetchCurrentPlan(user.id);
      
      // Fetch enhanced diary data
      fetchGoals(user.id);
      fetchCurrentWeekReflection(user.id);
      fetchProgressPhotos(user.id);
      calculateStreak(user.id);
    }
  }, [
    user, 
    fetchSessions, 
    fetchCurrentPlan, 
    fetchGoals, 
    fetchCurrentWeekReflection, 
    fetchProgressPhotos,
    calculateStreak
  ]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as any);
  };
  
  return (
    <div className="flex h-screen text-text-primary">
      {/* Global DashboardBackground from main.tsx will now be visible */}
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="container mx-auto px-4 py-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">Training Journal</h1>
            <p className="text-text-secondary">Track your fitness journey and reflect on your progress</p>
          </header>
          
          {/* Tabs Container */}
          <Tabs 
            defaultValue="daily" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full"
            data-testid="journal-tabs"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger 
                value="daily"
                className="flex items-center justify-center py-3"
                data-testid="daily-tab-trigger"
              >
                <CalendarDays size={16} className="mr-2" />
                <span className="hidden sm:inline">Daily Log</span>
                <span className="sm:hidden">Daily</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="weekly"
                className="flex items-center justify-center py-3"
                data-testid="weekly-tab-trigger"
              >
                <BarChart2 size={16} className="mr-2" />
                <span className="hidden sm:inline">Weekly Review</span>
                <span className="sm:hidden">Weekly</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="goals"
                className="flex items-center justify-center py-3"
                data-testid="goals-tab-trigger"
              >
                <Target size={16} className="mr-2" />
                <span className="hidden sm:inline">Goals & Reflections</span>
                <span className="sm:hidden">Goals</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Tab content */}
            <TabsContent value="daily" className="mt-2">
              <DailyLogTab />
            </TabsContent>
            
            <TabsContent value="weekly" className="mt-2">
              <WeeklyReviewTab />
            </TabsContent>
            
            <TabsContent value="goals" className="mt-2">
              <GoalsReflectionsTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default EnhancedDiaryPage;
