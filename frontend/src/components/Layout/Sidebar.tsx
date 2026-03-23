import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Tags, 
  Package, 
  LogOut, 
  Settings,
  X,
  User as UserIcon,
  // BarChart3
} from 'lucide-react';
import { Role } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      roles: [Role.SuperAdmin, Role.CompanyAdmin, Role.Manager, Role.Viewer] 
    },
    { 
      label: 'Companies', 
      path: '/companies', 
      icon: Building2, 
      roles: [Role.SuperAdmin] 
    },
    { 
      label: 'Users', 
      path: '/users', 
      icon: Users, 
      roles: [Role.CompanyAdmin] 
    },
    { 
      label: 'Categories', 
      path: '/categories', 
      icon: Tags, 
      roles: [Role.Manager, Role.Viewer] 
    },
    { 
      label: 'Inventory Items', 
      path: '/items', 
      icon: Package, 
      roles: [Role.Manager, Role.Viewer] 
    },
    // { 
    //   label: 'Summary Reports', 
    //   path: '/reports', 
    //   icon: BarChart3, 
    //   roles: [Role.CompanyAdmin, Role.Manager, Role.Viewer] 
    // },
  ];

  const filteredMenuItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Package className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">StockPro</h1>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Inventory Management</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
            {filteredMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className={`w-5 h-5 transition-colors`} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer User Profile */}
          <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
            <div className="mb-4 px-2">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-slate-800 truncate">{user?.email}</span>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    {user ? Role[user.role] : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NavLink 
                to="/settings"
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) => `
                  flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all text-sm font-medium
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white border-transparent hover:border-slate-200'}
                `}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </NavLink>
              <button 
                onClick={logout}
                className="flex items-center justify-center gap-2 p-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-sm font-medium"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
