import { useState, useEffect } from 'react';
import api from '../api/axios';
import { SummaryData } from '../types';
import { Package, TrendingUp, DollarSign, Tags, AlertCircle, BarChart3, PieChart, FileText } from 'lucide-react';

const Reports = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/Reports/summary');
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load summary data", err);
        setError("Could not load summary information.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium">Generating your report summary...</p>
    </div>
  );

  if (error || !summary) return (
    <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-red-800">Error</h3>
      <p className="text-red-600">{error || "Something went wrong"}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Analytics & Insights</h2>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Inventory Summary</h1>
        <p className="text-slate-500 mt-2">A comprehensive overview of your stock and financial value.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Items Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Package className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-tighter">Products</span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Unique Items</p>
          <h3 className="text-4xl font-black text-slate-900">{summary.totalItems}</h3>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-3 h-3" />
            <span>Across all categories</span>
          </div>
        </div>

        {/* Total Quantity Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tighter">Stock</span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Quantity on Hand</p>
          <h3 className="text-4xl font-black text-slate-900">{summary.totalQuantity}</h3>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
            <Package className="w-3 h-3" />
            <span>Total units in warehouse</span>
          </div>
        </div>

        {/* Total Value Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <DollarSign className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter">Value</span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Inventory Value</p>
          <h3 className="text-4xl font-black text-slate-900">
            ${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
            <TrendingUp className="w-3 h-3" />
            <span>Current market valuation</span>
          </div>
        </div>

        {/* Total Categories Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Tags className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-tighter">Structure</span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Active Categories</p>
          <h3 className="text-4xl font-black text-slate-900">{summary.totalCategories}</h3>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
            <PieChart className="w-3 h-3" />
            <span>Organized groups</span>
          </div>
        </div>

        {/* Low Stock Items Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertCircle className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full uppercase tracking-tighter">Alerts</span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Low Stock Alerts</p>
          <h3 className="text-4xl font-black text-slate-900">{summary.lowStockItemsCount}</h3>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Items below threshold (10)</span>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white overflow-hidden relative">
         <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl font-bold mb-4">Detailed Reports</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Need a more granular view? You can export your full inventory data to PDF or CSV from the items page, or set up automated email notifications for low stock alerts.
            </p>
            <div className="flex flex-wrap gap-4">
               <a href="/items" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all inline-flex items-center gap-2">
                 View Items List <Package className="w-4 h-4" />
               </a>
            </div>
         </div>
         {/* Decorative elements */}
         <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 right-0 translate-y-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

const ShieldAlert = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

export default Reports;
