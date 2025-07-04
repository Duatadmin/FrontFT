import React from 'react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import useDiaryStore from '../store/useDiaryStore';
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
  } = useDiaryStore();
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as any);
  };
  
  return (
            <div className="flex flex-col h-full text-text-primary">
      {/* Global DashboardBackground from main.tsx will now be visible */}
      
      {/* Main content */}
            
              <main className="flex-1 flex flex-col container mx-auto px-4 py-6">
                    <header className="mb-6 flex-shrink-0">
            <h1 className="font-display text-3xl font-bold text-white mb-6">Training Journal</h1>
            <p className="text-text-secondary">Track your fitness journey and reflect on your progress</p>
          </header>
          
          {/* Tabs Container */}
          <Tabs 
            defaultValue="daily" 
            value={activeTab} 
            onValueChange={handleTabChange}
                      className="w-full flex-1 flex flex-col"
            data-testid="journal-tabs"
          >
                        <TabsList className="grid w-full grid-cols-3 mb-6 flex-shrink-0">
              <TabsTrigger 
                value="daily"
                className="flex items-center justify-center w-full px-[14px] py-2 rounded-xl text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:outline-none data-[state=active]:bg-accent-lime/20 data-[state=active]:text-accent-lime"
                data-testid="daily-tab-trigger"
              >
                <CalendarDays size={16} className="mr-2" />
                <span className="hidden sm:inline">Daily Log</span>
                <span className="sm:hidden">Daily</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="weekly"
                className="flex items-center justify-center w-full px-[14px] py-2 rounded-xl text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:outline-none data-[state=active]:bg-accent-lime/20 data-[state=active]:text-accent-lime"
                data-testid="weekly-tab-trigger"
              >
                <BarChart2 size={16} className="mr-2" />
                <span className="hidden sm:inline">Weekly Review</span>
                <span className="sm:hidden">Weekly</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="goals"
                className="flex items-center justify-center w-full px-[14px] py-2 rounded-xl text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:outline-none data-[state=active]:bg-accent-lime/20 data-[state=active]:text-accent-lime"
                data-testid="goals-tab-trigger"
              >
                <Target size={16} className="mr-2" />
                <span className="hidden sm:inline">Goals & Reflections</span>
                <span className="sm:hidden">Goals</span>
              </TabsTrigger>
            </TabsList>

            {/* Conditionally render FiltersBar for the daily log tab */}
            {/* {activeTab === 'daily' && <FiltersBar />} */}
            
            {/* Tab content */}
                        <TabsContent value="daily" className="mt-2 flex-1">
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
  );
};

export default EnhancedDiaryPage;
