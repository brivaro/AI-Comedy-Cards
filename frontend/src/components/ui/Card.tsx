import React from 'react';
import clsx from 'clsx';

interface CardProps {
  text?: string;
  color?: 'white' | 'black';
  isSelectable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  text, 
  color = 'white', 
  isSelectable = false, 
  className = '', 
  children 
}) => {
  const baseClasses = "rounded-2xl shadow-2xl flex flex-col justify-between transition-all duration-300";
  
  const colorClasses = color === 'white' 
    ? 'bg-gradient-to-br from-white to-gray-50 text-gray-900 shadow-purple-500/10' 
    : 'glass-card text-white border border-white/10';

  const selectableClasses = isSelectable 
    ? 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:shadow-purple-500/50 hover:border-purple-500/50 active:scale-95' 
    : '';

  const sizeClasses = text ? 'w-48 h-64 p-6' : '';

  return (
    <div className={clsx(baseClasses, colorClasses, selectableClasses, sizeClasses, className)}>
      {text ? (
        <>
          <p className="font-bold text-lg leading-tight">{text}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-current/10">
            <span className="text-xs font-black tracking-tight opacity-50">AI COMEDY</span>
            <span className="text-2xl">🎭</span>
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
};