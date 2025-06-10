import useMediaQuery from '../hooks/useMediaQuery';
import MobileDashboard from './MobileDashboard';
import EnhancedDashboard from './EnhancedDashboard';

const ResponsiveDashboard = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? <MobileDashboard /> : <EnhancedDashboard />;
};

export default ResponsiveDashboard;
