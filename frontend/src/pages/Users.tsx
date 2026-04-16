import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, Role } from '../types';
import { Plus, Pencil, Trash2, UsersIcon, Loader2, AlertCircle, Send, Eye, EyeOff, 
  // LayoutDashboard 
} from 'lucide-react';
import LoadingButton from '../components/common/LoadingButton';
import DataView, { Column } from '../components/common/DataView';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import NotifyModal from '../components/common/NotifyModal';
import Pagination from '../components/common/Pagination';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  
  // Notify modal state
  const [notifyTarget, setNotifyTarget] = useState<User | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>(Role.Viewer);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/Users?page=${currentPage}&pageSize=${pageSize}`);
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setError('');
    } catch (err: any) {
      setError('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const openModal = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setEmail(user.email);
      setRole(user.role);
      setPassword(''); 
    } else {
      setEditingId(null);
      setEmail('');
      setRole(Role.Viewer);
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
        await api.put(`/Users/${editingId}`, { email, role });
      } else {
        await api.post('/Users', { email, password, role });
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      console.error('User action failed:', err);
      
      let message = 'Action failed.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          message = err.response.data;
        } else if (err.response.data.message) {
          message = err.response.data.message;
        } else if (err.response.data.errors) {
          message = Object.entries(err.response.data.errors)
            .map(([field, msgs]: any) => `${field}: ${msgs.join(', ')}`)
            .join('\n');
        } else {
          message = JSON.stringify(err.response.data, null, 2);
        }
      } else if (err.message) {
        message = err.message;
      }
      
      alert(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/Users/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleNotify = async (message: string): Promise<string> => {
    if (!notifyTarget) throw new Error('No target user');
    const res = await api.post(`/Users/${notifyTarget.id}/notify`, { message });
    return res.data.message;
  };

  const columns: Column<User>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            {(user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-slate-800">{user.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          user.role === Role.Manager ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {user.role}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={() => setNotifyTarget(user)}
            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Notify"
          >
            <Send className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openModal(user)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDeleteTarget(user)}
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
          <h1 className="text-2xl font-bold text-slate-800">Users Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage managers and viewers in your company</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add User
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
        <DataView<User>
          data={users}
          columns={columns}
          keyExtractor={(user) => user.id}
          emptyIcon={<UsersIcon className="w-12 h-12 text-slate-300" />}
          emptyMessage="No users created yet."
          emptySubMessage="Add your first team member to get started."
          cardRender={(user) => (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                    {(user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      user.role === Role.Manager ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setNotifyTarget(user)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Notify
                </button>
                <button
                  onClick={() => openModal(user)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(user)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        />
      )}
      {!isLoading && users.length > 0 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingId ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="user@example.com"
                  />
               </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                 <select 
                   value={role} 
                   onChange={e => setRole(e.target.value as Role)}
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                 >
                    <option value={Role.Manager}>Manager</option>
                    <option value={Role.Viewer}>Viewer</option>
                 </select>
              </div>
              {!editingId && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
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
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <LoadingButton 
                  type="submit"
                  loading={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg h-auto"
                >
                  {editingId ? 'Save Changes' : 'Create User'}
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
        itemName={deleteTarget?.email || ''}
        itemType="user"
      />

      {/* Notify Modal */}
      <NotifyModal
        isOpen={!!notifyTarget}
        onClose={() => setNotifyTarget(null)}
        onSend={handleNotify}
        recipientEmail={notifyTarget?.email || ''}
      />
    </div>
  );
};

export default Users;
