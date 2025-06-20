import React from 'react';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

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
    <div className="px-4 py-6">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="font-display text-3xl font-bold text-white mb-6" data-testid="programs-page-title">
            Training Programs & Goals
          </h1>
        </div>
        <p className="text-text-secondary">Design your training routines and track your fitness objectives.</p>
      </header>
      
      <Tabs 
        defaultValue="current" 
        className="w-full mb-4"
        data-testid="programs-tabs"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger 
            value="current"
            data-testid="current-program-tab-trigger"
            className="flex items-center justify-center w-full px-[14px] py-2 rounded-xl text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:outline-none data-[state=active]:bg-accent-violet/20 data-[state=active]:text-accent-violet"
          >
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Current Program</span>
            <span className="sm:hidden">Current</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="goals"
            data-testid="goals-tab-trigger"
            className="flex items-center justify-center w-full px-[14px] py-2 rounded-xl text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:outline-none data-[state=active]:bg-accent-violet/20 data-[state=active]:text-accent-violet"
          >
            <Target className="h-4 w-4" />
            <span>Goals</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="templates"
            data-testid="templates-tab-trigger"
            className="flex items-center justify-center w-full px-[14px] py-2 rounded-xl text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:outline-none data-[state=active]:bg-accent-violet/20 data-[state=active]:text-accent-violet"
          >
            <FileStack className="h-4 w-4" />
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
