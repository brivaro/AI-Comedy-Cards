import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  multiline,
  rows = 4,
  className,
  ...props
}) => {
  const baseClasses = 'w-full glass-card rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300';
  
  const Component = multiline ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <Component
          className={clsx(
            baseClasses,
            icon && 'pl-12',
            error && 'ring-2 ring-red-500/50 border-red-500/50',
            className
          )}
          {...(multiline ? { rows } : {})}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};