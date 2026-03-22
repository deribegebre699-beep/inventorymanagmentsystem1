import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
  itemType?: string;
}

type DeleteState = 'confirm' | 'deleting' | 'success' | 'error';

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
}) => {
  const [state, setState] = useState<DeleteState>('confirm');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = async () => {
    setState('deleting');
    try {
      await onConfirm();
      setState('success');
      setTimeout(() => {
        setState('confirm');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Delete failed.');
      setState('error');
      setTimeout(() => {
        setState('confirm');
        setErrorMsg('');
      }, 2500);
    }
  };

  const handleClose = () => {
    if (state === 'deleting') return;
    setState('confirm');
    setErrorMsg('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {state === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-rose-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete {itemType}?</h3>
              <p className="text-slate-500 text-sm text-center mb-6">
                Are you sure you want to delete <strong className="text-slate-700">"{itemName}"</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          )}

          {state === 'deleting' && (
            <motion.div key="deleting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Deleting...</p>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              </motion.div>
              <p className="text-emerald-700 font-bold text-lg">Deleted Successfully!</p>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              </motion.div>
              <p className="text-rose-700 font-bold text-lg">Delete Failed</p>
              <p className="text-rose-500 text-sm mt-1">{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmModal;
