import useIsMobile from '../hooks/useIsMobile';
import EnhancedDashboard from './EnhancedDashboard';
import EnhancedMobileDashboard from './EnhancedMobileDashboard';

const Dashboard = () => {
  // Check for URL parameter to force mobile view for testing
  const forceMobile = new URLSearchParams(window.location.search).get('mobile') === 'true';
  
  // Use the hook but override with forceMobile if specified
  const detectedMobile = useIsMobile();
  const isMobile = forceMobile || detectedMobile;
  
  // Render the appropriate dashboard based on viewport size or forced mode
  return isMobile ? <EnhancedMobileDashboard /> : <EnhancedDashboard />;
};

export default Dashboard;
