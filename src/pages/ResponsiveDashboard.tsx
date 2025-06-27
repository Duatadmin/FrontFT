

import useMediaQuery from '../hooks/useMediaQuery';
import EnhancedDashboard from './EnhancedDashboard';
import MobileDashboardPage from './MobileDashboardPage';

const ResponsiveDashboard = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');


  return isMobile ? <MobileDashboardPage /> : <EnhancedDashboard />;
};

export default ResponsiveDashboard;
