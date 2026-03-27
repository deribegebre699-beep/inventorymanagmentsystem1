import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always show first page
    if (startPage > 1) {
      buttons.push(
        <PageButton key={1} page={1} active={currentPage === 1} onClick={() => onPageChange(1)} />
      );
      if (startPage > 2) {
        buttons.push(<span key="dots-start" className="w-10 h-10 flex items-center justify-center text-slate-400"><MoreHorizontal className="w-4 h-4" /></span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PageButton key={i} page={i} active={currentPage === i} onClick={() => onPageChange(i)} />
      );
    }

    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots-end" className="w-10 h-10 flex items-center justify-center text-slate-400"><MoreHorizontal className="w-4 h-4" /></span>);
      }
      buttons.push(
        <PageButton key={totalPages} page={totalPages} active={currentPage === totalPages} onClick={() => onPageChange(totalPages)} />
      );
    }

    return buttons;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-2">
      <div className="text-sm font-medium text-slate-500 order-2 sm:order-1">
        Showing page <span className="text-slate-900 font-bold">{currentPage}</span> of <span className="text-slate-900 font-bold">{totalPages}</span>
      </div>

      <nav className="flex items-center gap-1 order-1 sm:order-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
        <NavButton 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1} 
          icon={<ChevronLeft className="w-5 h-5" />} 
          label="Previous"
        />
        
        <div className="flex items-center">
          {renderPageButtons()}
        </div>

        <NavButton 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages} 
          icon={<ChevronRight className="w-5 h-5" />} 
          label="Next"
        />
      </nav>
    </div>
  );
};

const PageButton = ({ page, active, onClick }: { page: number; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`relative w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
    }`}
  >
    {active && (
      <motion.div
        layoutId="activePage"
        className="absolute inset-0 bg-indigo-600 rounded-xl -z-10"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    {page}
  </button>
);

const NavButton = ({ onClick, disabled, icon, label }: { onClick: () => void; disabled: boolean; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all duration-200"
  >
    {icon}
  </button>
);

export default Pagination;
