import useIsMobile from '../hooks/useIsMobile';
import EnhancedDashboard from './EnhancedDashboard';
import EnhancedMobileDashboard from './EnhancedMobileDashboard';
import { useDashboardData } from '../dashboard/useDashboardData';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  // Check for URL parameter to force mobile view for testing
  const forceMobile = new URLSearchParams(window.location.search).get('mobile') === 'true';
  
  // Use the hook but override with forceMobile if specified
  const detectedMobile = useIsMobile();
  const isMobile = forceMobile || detectedMobile;
  
  const { loading, error } = useDashboardData();

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-accent-violet animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Error: {error.message}</div>;
  }
  
  // Render the appropriate dashboard based on viewport size or forced mode
  return isMobile ? <EnhancedMobileDashboard /> : <EnhancedDashboard />;
};

export default Dashboard;
