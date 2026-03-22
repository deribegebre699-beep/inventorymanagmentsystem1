import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Item, Category } from '../../types';
import { Package, Tags, AlertCircle, TrendingUp, DollarSign, ShoppingCart, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnalyticsCharts, { ChartData } from '../../components/dashboard/AnalyticsCharts';
import { exportToPDF, exportToCSV } from '../../utils/exportUtils';
import EmailReportModal from '../../components/common/EmailReportModal';
import { Mail } from 'lucide-react';

const ManagerDashboard = () => {
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

  const lowStockItems = items.filter((i: Item) => i.quantity <= 10);
  const totalItems = items.reduce((sum: number, item: Item) => sum + item.quantity, 0);
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Inventory Management</h2>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Stock Insights</h1>
        </div>
        <div className="flex gap-2">
            <Link to="/items" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Manage Stock</Link>
            <Link to="/categories" className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Categories</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Products</p>
          <h3 className="text-2xl font-bold text-slate-900">{items.length}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Total Stock</p>
          <h3 className="text-2xl font-bold text-slate-900">{totalItems}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Inventory Value</p>
          <h3 className="text-2xl font-bold text-slate-900">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4">
            <Tags className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Categories</p>
          <h3 className="text-2xl font-bold text-slate-900">{categories.length}</h3>
        </div>
      </div>

      <AnalyticsCharts 
        pieChartData={categoryDistribution}
        barChartData={categoryValueDistribution}
        pieChartTitle="Items by Category"
        barChartTitle="Stock Value by Category ($)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <ShieldAlert className="w-5 h-5 text-rose-500" />
               Low Stock Alerts
            </h2>
            <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-rose-100">
              {lowStockItems.length} items critical
            </span>
          </div>
          
          {lowStockItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">All items are sufficiently stocked.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item: Item) => (
                <div key={item.id} className="p-4 bg-slate-50/50 rounded-2xl flex justify-between items-center border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.quantity === 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                       <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.categoryName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${item.quantity === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {item.quantity} units
                    </p>
                  </div>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <Link to="/items" className="block text-center pt-4 text-sm font-bold text-indigo-600 hover:underline">
                  View all critical stock items &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden flex flex-col justify-between">
           <Package className="absolute -top-6 -right-6 w-32 h-32 text-indigo-500 opacity-50 rotate-12" />
           <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2 italic">Optimizing Stocks?</h3>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-8">
                 Regular stock audits help prevent loss and ensure your customers always find what they need.
              </p>
           </div>
           
           <div className="relative z-10 space-y-4">
              <button 
                onClick={() => exportToPDF(items, 'Manager Inventory Report')}
                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-lg"
              >
                 Export Inventory PDF
              </button>
              <button 
                onClick={() => exportToCSV(items, 'manager-inventory-report.csv')}
                className="w-full py-4 bg-indigo-500/30 text-white rounded-2xl font-black text-sm hover:bg-indigo-500/50 transition-colors border border-indigo-400/30"
              >
                 Export Inventory CSV
              </button>
              <button 
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-sm hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center gap-2 mt-2"
              >
                 <Mail className="w-4 h-4" />
                 Email Report
              </button>
           </div>
        </div>
      </div>
      
      <EmailReportModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        items={items} 
        reportTitle="Manager Inventory Report" 
      />
    </div>
  );
};

export default ManagerDashboard;
