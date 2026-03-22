import React, { useState } from 'react';
import { TrendingUp, TrendingDown, X, Loader2 } from 'lucide-react';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
  itemName: string;
  currentStock: number;
}

const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  currentStock,
}) => {
  const [adjustment, setAdjustment] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newStock = currentStock + adjustment;
  const isValid = newStock >= 0 && adjustment !== 0;

  const handleApply = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await onConfirm(adjustment);
      setAdjustment(0);
      onClose();
    } catch {
      // error handled externally
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setAdjustment(0);
    onClose();
  };

  const quickAdjust = (amount: number) => {
    setAdjustment((prev) => prev + amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="text-lg font-bold text-slate-800">
            Adjust Stock - {itemName}
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 space-y-5">
          {/* Current Stock */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Current Stock</p>
            <p className="text-3xl font-black text-slate-900">{currentStock}</p>
          </div>

          {/* Adjustment Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Adjustment</label>
            <div className="relative">
              <input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg font-medium"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Use positive numbers to increase stock, negative to decrease
            </p>
          </div>

          {/* Quick Adjust Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => quickAdjust(10)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              +10
            </button>
            <button
              onClick={() => quickAdjust(50)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              +50
            </button>
            <button
              onClick={() => quickAdjust(-10)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
            >
              <TrendingDown className="w-4 h-4" />
              -10
            </button>
          </div>

          {/* Preview */}
          <div className={`rounded-xl p-3 flex items-center gap-2 ${
            newStock < 0 ? 'bg-rose-50 border border-rose-100' : 'bg-indigo-50 border border-indigo-100'
          }`}>
            <p className={`text-sm font-medium ${newStock < 0 ? 'text-rose-600' : 'text-indigo-600'}`}>
              {newStock < 0
                ? `Stock cannot go below zero`
                : <>New stock will be: <strong className="text-base">{newStock}</strong></>
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-5 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!isValid || isSubmitting}
            className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustModal;
