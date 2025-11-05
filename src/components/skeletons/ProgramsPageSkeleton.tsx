import React from 'react';
import MainLayout from '../layout/MainLayout';
import UseAnimations from 'react-useanimations';
import loadingAnimation from 'react-useanimations/lib/loading';

/**
 * A loading indicator for the Programs page.
 */
const ProgramsPageSkeleton: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex justify-center items-center h-full w-full">
        <UseAnimations 
          animation={loadingAnimation} 
          size={60} 
          strokeColor="#DFF250" // Brand color
        />
      </div>
    </MainLayout>
  );
};

export default ProgramsPageSkeleton;
