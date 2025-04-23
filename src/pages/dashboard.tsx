import React, { useState, useEffect } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import { Loader2 } from 'lucide-react';

// Enhanced Dashboard Components
import EnhancedDashboard from './EnhancedDashboard';
import EnhancedMobileDashboard from './EnhancedMobileDashboard';

const Dashboard: React.FC = () => {
  // Check for URL parameter to force mobile view for testing
  const forceMobile = new URLSearchParams(window.location.search).get('mobile') === 'true';
  
  // Use the hook but override with forceMobile if specified
  const detectedMobile = useIsMobile();
  const isMobile = forceMobile || detectedMobile;
  
  const [loading, setLoading] = useState(true);
  
  // Log viewport detection for debugging
  useEffect(() => {
    console.log('Viewport detection:', { 
      detectedMobile, 
      forceMobile, 
      isMobile, 
      windowWidth: window.innerWidth 
    });
  }, [detectedMobile, forceMobile, isMobile]);
  
  // Simulate brief loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-12 h-12 text-accent-violet animate-spin" />
      </div>
    );
  }
  
  // Render the appropriate dashboard based on viewport size or forced mode
  return isMobile ? <EnhancedMobileDashboard /> : <EnhancedDashboard />;
};

export default Dashboard;
