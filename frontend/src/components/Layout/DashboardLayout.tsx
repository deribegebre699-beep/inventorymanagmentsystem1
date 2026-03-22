import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { Menu, Package } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800">StockPro</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:ml-72 min-h-screen flex flex-col transition-all duration-300 ease-in-out">
        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 items-center justify-end px-8 shadow-sm">
          <NotificationBell />
        </header>
        
        <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
