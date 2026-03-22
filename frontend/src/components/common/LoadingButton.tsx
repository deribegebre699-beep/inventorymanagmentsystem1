import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={loading || disabled}
      className={cn(
        "w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200",
        "hover:bg-indigo-700 hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-all flex items-center justify-center gap-2 group relative overflow-hidden",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
};

export default LoadingButton;
