import React, { ReactNode } from 'react';

export interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  noPadding?: boolean;
}

/**
 * BaseLayout Component
 * 
 * Provides a consistent base layout pattern for all pages.
 * - Uses h-lvh for proper mobile viewport handling
 * - Configurable scrolling behavior
 * - Proper safe area handling
 * - Can be composed with other layout components
 */
export const BaseLayout: React.FC<BaseLayoutProps> = ({ 
  children, 
  className = '',
  scrollable = true,
  noPadding = false
}) => {
  const scrollClass = scrollable ? 'overflow-y-auto' : 'overflow-hidden';
  const paddingClass = noPadding ? '' : 'p-4 sm:p-6 lg:p-8';
  
  return (
    <div className={`h-lvh flex flex-col ${className}`}>
      <div className={`flex-1 ${scrollClass} ${paddingClass} safe-top safe-left safe-right`}>
        {children}
      </div>
    </div>
  );
};

/**
 * FullScreenLayout Component
 * 
 * For pages that need full screen without scrolling (e.g., welcome, onboarding)
 */
export const FullScreenLayout: React.FC<BaseLayoutProps> = ({ children, className = '' }) => {
  return (
    <BaseLayout 
      scrollable={false} 
      noPadding={true} 
      className={className}
    >
      {children}
    </BaseLayout>
  );
};

/**
 * ContentLayout Component
 * 
 * For pages with scrollable content (e.g., dashboard, diary)
 */
export const ContentLayout: React.FC<BaseLayoutProps> = ({ children, className = '' }) => {
  return (
    <BaseLayout 
      scrollable={true} 
      noPadding={false} 
      className={className}
    >
      <div className="max-w-7xl mx-auto w-full">
        {children}
      </div>
    </BaseLayout>
  );
};