import React from 'react';
import { CircleNotch } from 'phosphor-react';

interface SpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ text = "Cargando...", size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-20 absolute inset-0 animate-ping`} />
        <CircleNotch 
          weight="bold" 
          className={`${sizes[size]} text-cyan-400 animate-spin`}
        />
      </div>
      {text && (
        <p className="text-lg font-semibold text-gray-300 animate-pulse">{text}</p>
      )}
    </div>
  );
};