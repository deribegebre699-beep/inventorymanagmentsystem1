import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import CompanyAdminDashboard from './dashboards/CompanyAdminDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import ViewerDashboard from './dashboards/ViewerDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case Role.SuperAdmin:
      return <SuperAdminDashboard />;
    case Role.CompanyAdmin:
      return <CompanyAdminDashboard />;
    case Role.Manager:
      return <ManagerDashboard />;
    case Role.Viewer:
      return <ViewerDashboard />;
    default:
      return (
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
          <h2 className="text-xl font-bold text-slate-800">Welcome!</h2>
          <p className="text-slate-500 mt-2">Your dashboard is being configured. Please check back later.</p>
        </div>
      );
  }
};

export default Dashboard;
