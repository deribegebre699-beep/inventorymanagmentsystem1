import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingButton from './LoadingButton';

interface NotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<string>;
  recipientEmail: string;
}

type NotifyState = 'form' | 'sending' | 'success' | 'error';

const NotifyModal: React.FC<NotifyModalProps> = ({
  isOpen,
  onClose,
  onSend,
  recipientEmail,
}) => {
  const [message, setMessage] = useState('');
  const [state, setState] = useState<NotifyState>('form');
  const [resultMsg, setResultMsg] = useState('');

  const handleSend = async () => {
    if (!message.trim()) return;
    setState('sending');
    try {
      const msg = await onSend(message);
      setResultMsg(msg);
      setState('success');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setResultMsg(err?.response?.data?.message || 'Failed to send notification.');
      setState('error');
      setTimeout(() => {
        setState('form');
        setResultMsg('');
      }, 2500);
    }
  };

  const handleClose = () => {
    if (state === 'sending') return;
    setState('form');
    setMessage('');
    setResultMsg('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {state === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-500" />
                  Send Notification
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  To: <strong className="text-slate-700">{recipientEmail}</strong>
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Enter your notification message..."
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleSend}
                    loading={false}
                    disabled={!message.trim()}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 h-auto"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </LoadingButton>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'sending' && (
            <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Sending notification...</p>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              </motion.div>
              <p className="text-emerald-700 font-bold text-lg">Sent Successfully!</p>
              <p className="text-slate-500 text-sm mt-1">{resultMsg}</p>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              </motion.div>
              <p className="text-rose-700 font-bold text-lg">Send Failed</p>
              <p className="text-rose-500 text-sm mt-1">{resultMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default NotifyModal;
