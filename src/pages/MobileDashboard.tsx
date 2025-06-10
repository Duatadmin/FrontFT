import MobileDashboardLayout from '../components/layout/MobileDashboardLayout';
import DashboardHeader from '../dashboard/components/DashboardHeader';
import WalletBalanceCard from '../dashboard/components/WalletBalanceCard';
import GlassFrame from '../components/GlassFrame';
import ActionButtons from '../dashboard/components/ActionButtons';
import AssetCarousel from '../dashboard/components/AssetCarousel';

const MobileDashboard = () => {
  return (
    <MobileDashboardLayout>
      <div className="space-y-6">
        <DashboardHeader />
        <GlassFrame>
          <WalletBalanceCard />
        </GlassFrame>
        <ActionButtons />
        <AssetCarousel />
      </div>
    </MobileDashboardLayout>
  );
};

export default MobileDashboard;
