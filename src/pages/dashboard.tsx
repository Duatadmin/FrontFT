import useMediaQuery from '../hooks/useMediaQuery';
import EnhancedDashboard from './EnhancedDashboard';
import MobileDashboardPage from './MobileDashboardPage';


const Dashboard = () => {
  // Check for URL parameter to force mobile view for testing
  const searchParams = new URLSearchParams(window.location.search);
  const forceMobile = searchParams.get('mobile') === 'true';

  // Detect viewport width
  const detectedMobile = useMediaQuery('(max-width: 768px)');

  const isMobile = forceMobile || detectedMobile;
  
  // Render the appropriate dashboard based on viewport size or forced mode
  return isMobile ? <MobileDashboardPage /> : <EnhancedDashboard />;
};

export default Dashboard;
