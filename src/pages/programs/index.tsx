import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import MainLayout from '../../components/layout/MainLayout';
import { Dumbbell, Target, FileStack } from 'lucide-react';
import CurrentProgramTab from '../../components/programs/CurrentProgramTab';

/**
 * Programs Page
 * Parent route for training plans and goals management
 * Uses MainLayout for consistent UI structure across the app
 * Integrated with Supabase for live data
 */
const ProgramsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary" data-testid="programs-page-title">
          Training Programs & Goals
        </h1>
      </div>
      
      <Tabs 
        defaultValue="current" 
        className="w-full"
        data-testid="programs-tabs"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger 
            value="current"
            data-testid="current-program-tab-trigger"
            className="flex items-center gap-2"
          >
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Current Program</span>
            <span className="sm:hidden">Current</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="goals"
            data-testid="goals-tab-trigger"
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            <span>Goals</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="templates"
            data-testid="templates-tab-trigger"
            className="flex items-center gap-2"
          >
            <FileStack className="h-4 w-4" />
            <span className="hidden sm:inline">Templates & Builder</span>
            <span className="sm:hidden">Templates</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" data-testid="current-program-tab-content">
          <CurrentProgramTab />
        </TabsContent>
        
        <TabsContent value="goals" data-testid="goals-tab-content">
          <div className="bg-background-surface rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Goals</h2>
            <p className="text-text-secondary">Track your fitness goals and progress here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" data-testid="templates-tab-content">
          <div className="bg-background-surface rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Templates & Builder</h2>
            <p className="text-text-secondary">Create and manage workout templates here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default ProgramsPage;
