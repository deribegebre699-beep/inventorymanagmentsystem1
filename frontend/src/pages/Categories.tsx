import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Category, SubCategory, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Pencil, Trash2, Tags, Loader2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import ImageUpload from '../components/common/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  
  const { user } = useAuth();
  const isManager = user?.role === Role.Manager;

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/Categories');
      // Filter out subcategories from the top level (they have a parentCategoryId)
      const topLevelCategories = res.data.filter((c: Category) => !c.parentCategoryId);
      setCategories(topLevelCategories);
      setError('');
    } catch (err: any) {
      setError('Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openModal = (category?: Category | SubCategory, parentId?: number) => {
    if (category) {
      setEditingId(category.id);
      setName(category.name);
      setDescription(category.description);
      setParentCategoryId('parentCategoryId' in category && category.parentCategoryId ? category.parentCategoryId : null);
      setPhotoUrl(category.photoUrl || '');
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
      setParentCategoryId(parentId || null);
      setPhotoUrl('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        name, 
        description, 
        parentCategoryId: parentCategoryId || null,
        photoUrl 
      };

      if (editingId) {
        await api.put(`/Categories/${editingId}`, payload);
      } else {
        await api.post('/Categories', payload);
      }
      closeModal();
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/Categories/${deleteTarget.id}`);
    fetchCategories();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories Management</h1>
          <p className="text-slate-500 text-sm mt-1">Organize your inventory with categories and subcategories</p>
        </div>
        {isManager && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        )}
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl border-dashed">
              <Tags className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No categories found. Create your first category to get started.</p>
            </div>
          ) : (
            categories.map((category) => {
              const hasSubcategories = category.subCategories && category.subCategories.length > 0;
              const isExpanded = expandedCategories[category.id];

              return (
                <div key={category.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      {category.photoUrl ? (
                         <img src={category.photoUrl} alt={category.name} className="w-12 h-12 rounded-xl object-cover bg-indigo-50 border border-indigo-100 shrink-0" />
                      ) : (
                         <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                           <Tags className="w-6 h-6" />
                         </div>
                      )}
                      <div className="flex gap-1">
                        {isManager && (
                           <>
                              <button 
                                onClick={() => openModal(undefined, category.id)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Add Subcategory"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => openModal(category)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setDeleteTarget(category)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-2 truncate" title={category.name}>
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                      {category.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Subcategories Section */}
                  {(hasSubcategories || isManager) && (
                    <div className="bg-slate-50 border-t border-slate-100 mt-auto">
                      <button 
                        onClick={() => toggleExpand(category.id)}
                        className="w-full px-5 py-3 flex items-center justify-between text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                           {category.subCategories?.length || 0} Subcategories
                        </span>
                        {hasSubcategories ? (
                           isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                        ) : (
                           <span className="text-xs font-normal text-slate-400 italic">None</span>
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && hasSubcategories && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white border-t border-slate-100 overflow-hidden"
                          >
                            <ul className="divide-y divide-slate-50">
                              {category.subCategories!.map(sub => (
                                <li key={sub.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 group/sub transition-colors">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                     {sub.photoUrl ? (
                                        <img src={sub.photoUrl} alt={sub.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                                     ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                     )}
                                     <span className="text-sm font-medium text-slate-700 truncate" title={sub.description || sub.name}>{sub.name}</span>
                                  </div>
                                  {isManager && (
                                    <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                       <button 
                                        onClick={() => openModal(sub, category.id)}
                                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                       >
                                         <Pencil className="w-3.5 h-3.5" />
                                       </button>
                                       <button 
                                         onClick={() => setDeleteTarget(sub as any)}
                                         className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                       >
                                         <Trash2 className="w-3.5 h-3.5" />
                                       </button>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && isManager && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingId ? 'Edit Category' : (parentCategoryId ? 'Add Subcategory' : 'Add New Category')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                 <input 
                   required
                   type="text" 
                   value={name} 
                   onChange={e => setName(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                   placeholder="e.g. Clothing, Electronics"
                 />
              </div>

              {/* Only show Parent Category dropdown if editing a subcategory or adding a subcategory */}
              {/* If editing a top-level category with existing subcategories, we shouldn't allow changing its parent easily (would need deep validation) */}
              {(parentCategoryId !== null || (!editingId && categories.length > 0)) && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Parent Category (Optional)</label>
                   <select 
                     value={parentCategoryId || ''} 
                     onChange={e => setParentCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                   >
                      <option value="">None (Top Level)</option>
                      {categories.filter(c => c.id !== editingId).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                   </select>
                </div>
              )}

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                 <textarea 
                   rows={3}
                   value={description} 
                   onChange={e => setDescription(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                   placeholder="Brief description..."
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Category Photo (Optional)</label>
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
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || ''}
        itemType={deleteTarget?.parentCategoryId ? "subcategory" : "category"}
      />
    </div>
  );
};

export default Categories;
