import React from 'react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import useDiaryStore from '../store/useDiaryStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-2 sm:py-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Training Journal</h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2">Track your fitness journey and reflect on your progress</p>
        </div>
      </div>
      
      {/* Tabs Container */}
      <Tabs 
        defaultValue="daily" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
        data-testid="journal-tabs"
      >
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger 
            value="daily"
            className="flex items-center justify-center gap-1 sm:gap-2 w-full px-2 sm:px-3 py-2 rounded-xl text-sm sm:text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:outline-none data-[state=active]:bg-accent-lime/20 data-[state=active]:text-accent-lime"
            data-testid="daily-tab-trigger"
          >
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Daily Log</span>
            <span className="sm:hidden">Daily</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="weekly"
            className="flex items-center justify-center gap-1 sm:gap-2 w-full px-2 sm:px-3 py-2 rounded-xl text-sm sm:text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:outline-none data-[state=active]:bg-accent-lime/20 data-[state=active]:text-accent-lime"
            data-testid="weekly-tab-trigger"
          >
            <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Weekly Review</span>
            <span className="sm:hidden">Weekly</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="goals"
            className="flex items-center justify-center gap-1 sm:gap-2 w-full px-2 sm:px-3 py-2 rounded-xl text-sm sm:text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-lime focus-visible:outline-none data-[state=active]:bg-accent-lime/20 data-[state=active]:text-accent-lime"
            data-testid="goals-tab-trigger"
          >
            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Goals & Reflections</span>
            <span className="sm:hidden">Goals</span>
          </TabsTrigger>
        </TabsList>

        {/* Conditionally render FiltersBar for the daily log tab */}
        {/* {activeTab === 'daily' && <FiltersBar />} */}
        
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
    </div>
  );
};

export default EnhancedDiaryPage;
