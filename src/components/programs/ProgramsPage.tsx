import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrentProgramTab } from './current/CurrentProgramTab'; // Using the one from 'current' subdirectory
import { GoalsTab } from './goals/GoalsTab';
import { TemplatesTab } from './templates/TemplatesTab';
import { PlansOverviewDisplay } from './PlansOverviewDisplay';

export const ProgramsPage: React.FC = () => {
  // Determine the default active tab. 
  // For example, if there's an active plan, default to 'current', otherwise 'overview' or 'templates'.
  // This logic can be more sophisticated based on application state.
  const defaultTab = 'overview'; // Default to 'overview' for a general landing

  return (
    <div className="p-4 md:p-6">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="overview">All Plans</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <CurrentProgramTab />
        </TabsContent>
        <TabsContent value="overview">
          <PlansOverviewDisplay />
        </TabsContent>
        <TabsContent value="goals">
          <GoalsTab />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
