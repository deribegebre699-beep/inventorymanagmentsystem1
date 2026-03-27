import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Company } from '../types';
import { Plus, Pencil, Trash2, Building2, AlertCircle, Eye, EyeOff, Calendar, Loader2 } from 'lucide-react';
import LoadingButton from '../components/common/LoadingButton';
import DataView, { Column } from '../components/common/DataView';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import Pagination from '../components/common/Pagination';


const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/Companies?page=${currentPage}&pageSize=${pageSize}`);
      setCompanies(res.data.data);
      setTotalPages(res.data.totalPages);
      setError('');
    } catch (err: any) {
      setError('Failed to load companies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage]);

  const openModal = (company?: Company) => {
    if (company) {
      setEditingId(company.id);
      setName(company.name);
      setEmail(company.email);
      setPassword('');
    } else {
      setEditingId(null);
      setName('');
      setEmail('');
      setPassword('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/Companies/${editingId}`, { name, email });
      } else {
        await api.post('/Companies', { name, email, password });
      }
      closeModal();
      fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/Companies/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete company.');
    }
  };

  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: 'Company Name',
      render: (company) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            {company.name.charAt(0)}
          </div>
          <span className="font-medium text-slate-800">{company.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Admin Email',
      render: (company) => <span className="text-slate-600">{company.email}</span>,
    },
    {
      key: 'createdAt',
      header: 'Joined At',
      render: (company) => <span className="text-slate-500">{new Date(company.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (company) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={() => openModal(company)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDeleteTarget(company)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Companies Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage tenant companies in the system</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Company
        </button>
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
        <DataView<Company>
          data={companies}
          columns={columns}
          keyExtractor={(company) => company.id}
          emptyIcon={<Building2 className="w-12 h-12 text-slate-300" />}
          emptyMessage="No companies registered yet."
          cardRender={(company) => (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {company.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{company.name}</p>
                  <p className="text-sm text-slate-500 truncate">{company.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(company.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openModal(company)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(company)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        />
      )}
      {!isLoading && companies.length > 0 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                 <input 
                   required
                   type="text" 
                   value={name} 
                   onChange={e => setName(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                   placeholder="Acme Corp"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                 <input 
                   required
                   type="email" 
                   value={email} 
                   onChange={e => setEmail(e.target.value)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                   placeholder="admin@acme.com"
                 />
              </div>
              {!editingId && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Admin Password</label>
                   <div className="relative">
                     <input 
                       required
                       type={showPassword ? "text" : "password"} 
                       value={password} 
                       onChange={e => setPassword(e.target.value)}
                       className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                       placeholder="••••••••"
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                     >
                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                   </div>
                </div>
              )}
              <div className="pt-4 flex gap-3 w-full">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <LoadingButton 
                  type="submit"
                  loading={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg h-auto"
                >
                  {editingId ? 'Save Changes' : 'Create Company'}
                </LoadingButton>
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
        itemType="company"
      />
    </div>
  );
};

export default Companies;
