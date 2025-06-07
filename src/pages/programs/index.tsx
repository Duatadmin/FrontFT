import React from 'react';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
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
  useAuthGuard();
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-text-primary" data-testid="programs-page-title">
          Training Programs & Goals
        </h1>
      </div>
      
      <Tabs 
        defaultValue="current" 
        className="w-full mb-4"
        data-testid="programs-tabs"
      >
        <TabsList className="grid grid-cols-3 mb-6 w-full bg-background-surface">
          <TabsTrigger 
            value="current"
            data-testid="current-program-tab-trigger"
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm"
          >
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Current Program</span>
            <span className="sm:hidden">Current</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="goals"
            data-testid="goals-tab-trigger"
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm"
          >
            <Target className="h-4 w-4" />
            <span>Goals</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="templates"
            data-testid="templates-tab-trigger"
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm"
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
    </MainLayout>
  );
};

export default ProgramsPage;
