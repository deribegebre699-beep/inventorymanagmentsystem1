import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Item, Category, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Package, Loader2, AlertCircle, Search, CheckCircle2, TrendingUp, Pencil, Trash2, Plus, DollarSign, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingButton from '../components/common/LoadingButton';
import DataView, { Column } from '../components/common/DataView';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import StockAdjustModal from '../components/common/StockAdjustModal';
import ImageUpload from '../components/common/ImageUpload';


const QUANTITY_TYPES = ['units', 'kg', 'grams', 'liters', 'pieces', 'boxes', 'packs'];

const Items = () => {
  const [items, setItems] = useState<Item[]>([]);

  // We need to flatten categories to include subcategories in the dropdown
  const [flatCategories, setFlatCategories] = useState<{id: number, name: string, isSub: boolean}[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  // Stock Adjust modal state
  const [stockAdjustTarget, setStockAdjustTarget] = useState<Item | null>(null);

  const { user } = useAuth();
  const isManager = user?.role === Role.Manager;

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [quantityType, setQuantityType] = useState('units');
  const [categoryId, setCategoryId] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [itemsRes, catRes] = await Promise.all([
        api.get('/Items'),
        api.get('/Categories')
      ]);
      setItems(itemsRes.data);
      
      const rawCategories = catRes.data;
      
      // Flatten categories for dropdown
      const flattened: {id: number, name: string, isSub: boolean}[] = [];
      rawCategories.forEach((cat: Category) => {
        flattened.push({ id: cat.id, name: cat.name, isSub: false });
        if (cat.subCategories && cat.subCategories.length > 0) {
          cat.subCategories.forEach(sub => {
            flattened.push({ id: sub.id, name: `↳ ${sub.name}`, isSub: true });
          });
        }
      });
      setFlatCategories(flattened);
      
      if (flattened.length > 0) setCategoryId(flattened[0].id);
      
      setError('');
    } catch (err: any) {
      setError('Failed to load inventory data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item?: Item) => {
    if (item) {
      setEditingId(item.id);
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price);
      setQuantity(item.quantity);
      setQuantityType(item.quantityType || 'units');
      setCategoryId(item.categoryId);
      setPhotoUrl(item.photoUrl || '');
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
      setPrice(0);
      setQuantity(0);
      setQuantityType('units');
      setPhotoUrl('');
      if (flatCategories.length > 0) setCategoryId(flatCategories[0].id);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/Items/${editingId}`, { name, description, price, categoryId, quantityType, photoUrl });
        showNotification('Item updated successfully!', 'success');
      } else {
        await api.post('/Items', { name, description, price, quantity, categoryId, quantityType, photoUrl });
        showNotification('Item created successfully!', 'success');
      }
      closeModal();
      const res = await api.get('/Items');
      setItems(res.data);
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/Items/${deleteTarget.id}`);
    const res = await api.get('/Items');
    setItems(res.data);
  };

  const handleStockConfirm = async (amount: number) => {
    if (!stockAdjustTarget) return;
    await api.post(`/Items/${stockAdjustTarget.id}/stock`, { amount });
    const res = await api.get('/Items');
    setItems(res.data);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = filteredItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const columns: Column<Item>[] = [
    {
      key: 'item',
      header: 'Item Details',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">{item.name}</span>
            <span className="text-xs text-slate-500 mt-0.5" title={item.description}>
              {item.description ? (item.description.length > 40 ? item.description.slice(0, 40) + '...' : item.description) : 'No description'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {item.categoryName || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (item) => <span className="font-medium text-slate-700">${item.price.toFixed(2)}</span>,
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'center',
      render: (item) => (
        <span className={`font-bold px-3 py-1 rounded-full text-xs ${item.quantity > 10 ? 'bg-emerald-50 text-emerald-700' : item.quantity > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
          {item.quantity} {item.quantityType || 'units'}
        </span>
      ),
    },
    ...(isManager ? [{
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (item: Item) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={() => setStockAdjustTarget(item)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            title="Adjust Stock"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openModal(item)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : [])
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Items</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all products and stock levels</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64 transition-all"
            />
          </div>
          {isManager && (
            <button
              onClick={() => openModal()}
              disabled={flatCategories.length === 0}
              className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title={flatCategories.length === 0 ? "Create a category first" : ""}
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[60] p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <DataView<Item>
          data={filteredItems}
          columns={columns}
          keyExtractor={(item) => item.id}
          emptyIcon={<Package className="w-12 h-12 text-slate-300" />}
          emptyMessage="No items found."
          emptySubMessage={items.length === 0 ? "Add your first inventory item to get started." : "Try adjusting your search query."}
          cardRender={(item) => (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
              {item.photoUrl ? (
                <div className="w-full h-32 shrink-0 bg-slate-100 border-b border-slate-100">
                  <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-32 shrink-0 bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-300">
                  <Package className="w-10 h-10" />
                </div>
              )}
              
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2 pr-2">{item.name}</h3>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-sm shrink-0">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-grow">{item.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                 <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase tracking-wider truncate max-w-[120px]">
                   {item.categoryName || 'Uncategorized'}
                 </span>
                 <span className={`font-bold px-2 py-1 rounded text-xs ${item.quantity > 10 ? 'bg-emerald-50 text-emerald-700' : item.quantity > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                    {item.quantity} {item.quantityType || 'units'}
                 </span>
              </div>

              {isManager && (
                <div className="flex items-center gap-1 pt-3 border-t border-slate-100 mt-auto">
                  <button
                    onClick={() => setStockAdjustTarget(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Adjust Stock"
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> Stock
                  </button>
                  <button
                    onClick={() => openModal(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
              </div>
            </div>
          )}
        />
      )}

      {/* Summary Footer */}
      {!isLoading && items.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-end gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
              <List className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Products</p>
              <h4 className="text-xl font-black text-slate-800">{filteredItems.length}</h4>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Quantity</p>
              <h4 className="text-xl font-black text-slate-800">{totalQuantity.toLocaleString()}</h4>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Value</p>
              <h4 className="text-xl font-black text-slate-800">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {isModalOpen && isManager && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingId ? 'Edit Item' : 'Add New Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                 <input 
                   required
                   type="text" 
                   value={name} 
                   onChange={e => setName(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                   <input 
                     required
                     type="number" 
                     min="0"
                     step="0.01"
                     value={price} 
                     onChange={e => setPrice(parseFloat(e.target.value))}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                   />
                </div>
                {!editingId && (
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Init Quantity</label>
                     <input 
                       required
                       type="number" 
                       min="0"
                       value={quantity} 
                       onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                     />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                   <select 
                     value={categoryId} 
                     onChange={e => setCategoryId(parseInt(e.target.value))}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                   >
                      {flatCategories.map(c => (
                        <option key={c.id} value={c.id} className={c.isSub ? "pl-4 text-slate-600" : "font-semibold"}>{c.name}</option>
                      ))}
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Type</label>
                  <select
                     value={quantityType}
                     onChange={e => setQuantityType(e.target.value)}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    {QUANTITY_TYPES.map(qt => (
                      <option key={qt} value={qt}>{qt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                 <textarea 
                   rows={2}
                   value={description} 
                   onChange={e => setDescription(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Item Photo (Optional)</label>
                 <ImageUpload 
                   value={photoUrl} 
                   onChange={setPhotoUrl}
                 />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex-1">
                   <LoadingButton 
                     type="submit"
                     loading={isSubmitting}
                     className="w-full py-2.5 rounded-xl h-auto"
                   >
                     {editingId ? 'Save Changes' : 'Create Item'}
                   </LoadingButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <StockAdjustModal
        isOpen={!!stockAdjustTarget}
        onClose={() => setStockAdjustTarget(null)}
        onConfirm={handleStockConfirm}
        itemName={stockAdjustTarget?.name || ''}
        currentStock={stockAdjustTarget?.quantity || 0}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || ''}
        itemType="item"
      />
    </div>
  );
};

export default Items;
