
import React from 'react';

interface CardProps {
  text?: string;
  color?: 'white' | 'black';
  isSelectable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ text, color = 'white', isSelectable = false, className = '', children }) => {
  const baseClasses = "rounded-lg shadow-lg flex flex-col justify-between transform transition-transform duration-200";
  
  const colorClasses = color === 'white' 
    ? 'bg-brand-secondary text-brand-primary' 
    : 'bg-gray-800 text-brand-secondary border border-gray-600';

  const selectableClasses = isSelectable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/50' : '';

  const sizeClasses = text ? 'w-48 h-64 p-4' : '';

  return (
    <div className={`${baseClasses} ${colorClasses} ${selectableClasses} ${sizeClasses} ${className}`}>
      {text ? (
        <>
          <p className="font-semibold text-lg">{text}</p>
          <p className="text-sm font-bold self-end tracking-tighter">AI COMEDY CARDS</p>
        </>
      ) : (
        children
      )}
    </div>
  );
};
