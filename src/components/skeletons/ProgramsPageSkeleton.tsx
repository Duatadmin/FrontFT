import React from 'react';
import MainLayout from '../layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';

/**
 * A skeleton loader for the Programs page that preserves layout structure
 * Prevents layout shift by matching the exact structure of the Programs page
 */
const ProgramsPageSkeleton: React.FC = () => {
  return (
    <MainLayout>
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-64 bg-background-card/30 animate-pulse rounded-lg"></div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="w-full">
        <div className="grid grid-cols-3 gap-2 mb-8 bg-background-card/20 p-1 rounded-lg">
          <div className="h-10 bg-background-card/40 animate-pulse rounded-lg"></div>
          <div className="h-10 bg-background-card/30 animate-pulse rounded-lg"></div>
          <div className="h-10 bg-background-card/30 animate-pulse rounded-lg"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-4">
          {/* Program info card skeleton */}
          <div className="bg-background-surface rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <div className="h-7 w-48 bg-background-card/40 animate-pulse rounded-lg"></div>
              <div className="h-6 w-20 bg-accent-green/10 animate-pulse rounded-full mt-2 sm:mt-0"></div>
            </div>
            <div className="h-4 w-full bg-background-card/30 animate-pulse rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-background-card/30 animate-pulse rounded mb-4"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-background-card/40 animate-pulse mr-2"></div>
                <div className="h-4 w-32 bg-background-card/30 animate-pulse rounded"></div>
              </div>
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-background-card/40 animate-pulse mr-2"></div>
                <div className="h-4 w-32 bg-background-card/30 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Weekly plan skeleton */}
          <div className="h-5 w-32 bg-background-card/40 animate-pulse rounded mb-3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-3 mb-6">
            {Array(7).fill(0).map((_, i) => (
              <div key={i} className="bg-background-surface rounded-xl p-4 animate-pulse">
                <div className="h-5 w-20 bg-background-card/40 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-background-card/30 rounded"></div>
                  <div className="h-4 w-4/5 bg-background-card/30 rounded"></div>
                  <div className="h-4 w-2/3 bg-background-card/30 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProgramsPageSkeleton;
