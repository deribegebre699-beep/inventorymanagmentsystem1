import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Company } from '../../types';
import { Building2, Calendar, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/Companies?all=true');
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (isLoading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">System Administration</h2>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Global Overview</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-xs font-medium text-slate-500">Total Companies</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{companies.length}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Live</span>
          </div>
          <p className="text-xs font-medium text-slate-500">System Health</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-0.5 text-emerald-500 uppercase tracking-tight">Optimal</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">Recent Registrations (7d)</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
            {companies.filter((c: Company) => {
                const date = new Date(c.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date > weekAgo;
            }).length}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Recently Onboarded Companies</h2>
          <Link to="/companies" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group transition-all">
            Manage All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {companies.slice(0, 5).map(company => (
            <div key={company.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {company.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{company.name}</h4>
                  <p className="text-sm text-slate-500">{company.email}</p>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm w-fit flex items-center gap-2">
                <span>Joined {new Date(company.createdAt).toLocaleDateString()}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          ))}
          {companies.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No recent companies found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
