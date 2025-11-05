import React from 'react';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

import { Dumbbell, Target, FileStack } from 'lucide-react';
import CurrentProgramTab from '../../components/programs/CurrentProgramTab';

/**
 * Programs Page
 * Parent route for training plans and goals management
 * Uses MainLayout for consistent UI structure across the app
 * Integrated with Supabase for live data
 */
const ProgramsPage: React.FC = () => {
  useAuthGuard();
  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-20 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-2 sm:py-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white" data-testid="programs-page-title">
            Training Programs & Goals
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2">Design your training routines and track your fitness objectives.</p>
        </div>
      </div>
      
      <Tabs 
        defaultValue="current" 
        className="w-full"
        data-testid="programs-tabs"
      >
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger 
            value="current"
            data-testid="current-program-tab-trigger"
            className="flex items-center justify-center gap-1 sm:gap-2 w-full px-2 sm:px-3 py-2 rounded-xl text-sm sm:text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:outline-none data-[state=active]:bg-accent-violet/20 data-[state=active]:text-accent-violet"
          >
            <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Current Program</span>
            <span className="sm:hidden">Current</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="goals"
            data-testid="goals-tab-trigger"
            className="flex items-center justify-center gap-1 sm:gap-2 w-full px-2 sm:px-3 py-2 rounded-xl text-sm sm:text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:outline-none data-[state=active]:bg-accent-violet/20 data-[state=active]:text-accent-violet"
          >
            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Goals</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="templates"
            data-testid="templates-tab-trigger"
            className="flex items-center justify-center gap-1 sm:gap-2 w-full px-2 sm:px-3 py-2 rounded-xl text-sm sm:text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:outline-none data-[state=active]:bg-accent-violet/20 data-[state=active]:text-accent-violet"
          >
            <FileStack className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Templates & Builder</span>
            <span className="sm:hidden">Templates</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" data-testid="current-program-tab-content" className="mt-4">
          <CurrentProgramTab />
        </TabsContent>
        
        <TabsContent value="goals" data-testid="goals-tab-content" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Goals</CardTitle>
              <CardDescription className="text-sm">
                Set and track your fitness goals here.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" data-testid="templates-tab-content" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Templates</CardTitle>
              <CardDescription className="text-sm">
                Browse and customize training templates.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgramsPage;
