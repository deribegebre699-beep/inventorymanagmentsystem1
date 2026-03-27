import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { User, Role as UserRole } from '../../types';
import { Users, UserPlus, ShieldAlert, Award, ArrowRight, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnalyticsCharts, { ChartData } from '../../components/dashboard/AnalyticsCharts';

const CompanyAdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/Users?all=true');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (isLoading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  const managersCount = users.filter((u: User) => u.role === UserRole.Manager).length;
  const viewersCount = users.filter((u: User) => u.role === UserRole.Viewer).length;
  const companyAdminsCount = users.filter((u: User) => u.role === UserRole.CompanyAdmin).length;

  const roleDistribution: ChartData[] = [
    { name: 'Company Admin', value: companyAdminsCount },
    { name: 'Managers', value: managersCount },
    { name: 'Viewers', value: viewersCount },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Building className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest">Company Administration</h2>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Organization Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Team Members</p>
            <h3 className="text-3xl font-bold text-slate-900">{users.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Managers</p>
            <h3 className="text-3xl font-bold text-slate-900">{managersCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Viewers</p>
            <h3 className="text-3xl font-bold text-slate-900">{viewersCount}</h3>
          </div>
        </div>
      </div>

      <AnalyticsCharts 
        pieChartData={roleDistribution}
        barChartData={roleDistribution}
        pieChartTitle="Users by Role"
        barChartTitle="User Count by Role"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
             <UserPlus className="w-5 h-5 text-indigo-500" />
             Quick Actions
          </h3>
          <div className="space-y-4">
             <Link 
               to="/users" 
               className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl group transition-all"
             >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-indigo-100 transition-all">
                      <Users className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="font-bold">Team Management</h4>
                      <p className="text-xs text-slate-500">Add or remove members from your company</p>
                   </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
             </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Recent Members</h3>
           </div>
           <div className="divide-y divide-slate-50">
              {users.slice(0, 4).map((user: User) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                        {(user.email || 'U').charAt(0)}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-800">{user.email}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
                     </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                </div>
              ))}
              {users.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-sm">No members added yet.</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAdminDashboard;
