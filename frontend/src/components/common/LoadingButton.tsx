import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, HTMLMotionProps } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LoadingButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// Combine HTML attributes with Motion props, but be careful with overlapping types
type CombinedProps = LoadingButtonProps & HTMLMotionProps<"button">;

const LoadingButton: React.FC<CombinedProps> = ({
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
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
    </motion.button>
  );
};

export default LoadingButton;
