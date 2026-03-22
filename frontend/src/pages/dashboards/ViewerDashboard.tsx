import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Item, Category } from '../../types';
import { BarChart3, FileDown, Download, Table, TrendingUp } from 'lucide-react';
import AnalyticsCharts, { ChartData } from '../../components/dashboard/AnalyticsCharts';
import { exportToPDF, exportToCSV } from '../../utils/exportUtils';
import EmailReportModal from '../../components/common/EmailReportModal';
import { Mail } from 'lucide-react';

const ViewerDashboard = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, catRes] = await Promise.all([
          api.get('/Items'),
          api.get('/Categories')
        ]);
        setItems(itemsRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  const totalValue = items.reduce((sum: number, item: Item) => sum + (item.quantity * item.price), 0);

  const categoryDistribution: ChartData[] = categories.map(cat => ({
    name: cat.name,
    value: items.filter(i => i.categoryId === cat.id).length
  })).filter(d => d.value > 0);

  const categoryValueDistribution: ChartData[] = categories.map(cat => ({
    name: cat.name,
    value: items.filter(i => i.categoryId === cat.id).reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Data Insights</h2>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Inventory Analysis</h1>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => exportToPDF(items, 'Viewer Inventory Report')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
               <FileDown className="w-4 h-4" />
               Export PDF
            </button>
            <button 
              onClick={() => exportToCSV(items, 'viewer-inventory-report.csv')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
            >
               <Download className="w-4 h-4" />
               CSV Export
            </button>
            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-indigo-700 border border-transparent rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
               <Mail className="w-4 h-4" />
               Email Report
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <TrendingUp className="absolute -top-2 -right-2 w-16 h-16 text-indigo-50 opacity-50 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Assets</p>
               <h3 className="text-2xl font-black text-slate-900">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 0})}</h3>
               <div className="mt-2 flex items-center gap-1.5 text-emerald-500 font-bold text-[10px]">
                  <span className="p-1 bg-emerald-50 rounded-md">↑ 14.5%</span>
                  <span>vs prev</span>
               </div>
            </div>
         </div>

         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <Table className="absolute -top-2 -right-2 w-16 h-16 text-slate-50 opacity-50 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Categories</p>
               <h3 className="text-2xl font-black text-slate-900">{categories.length}</h3>
               <div className="mt-2 flex items-center gap-1.5 text-slate-400 font-bold text-[10px]">
                  <span className="p-1 bg-slate-50 rounded-md">Stable</span>
                  <span>Sys load</span>
               </div>
            </div>
         </div>

         <div className="bg-indigo-600 p-5 rounded-2xl text-white shadow-xl shadow-indigo-100 sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Unique Items</p>
            <h3 className="text-2xl font-black">{items.length}</h3>
            <p className="mt-2 text-[11px] font-medium text-indigo-100 leading-relaxed max-w-sm">
               You are currently in **Viewer Mode**. You can analyze all data but record modifications are disabled.
            </p>
         </div>
      </div>

      <AnalyticsCharts 
        pieChartData={categoryDistribution}
        barChartData={categoryValueDistribution}
        pieChartTitle="Items by Category"
        barChartTitle="Stock Value by Category ($)"
      />

      <EmailReportModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        items={items} 
        reportTitle="Viewer Inventory Report" 
      />
    </div>
  );
};

export default ViewerDashboard;
