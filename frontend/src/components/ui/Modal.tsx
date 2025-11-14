import React, { useEffect } from 'react';
import { X } from 'phosphor-react';
import clsx from 'clsx';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ onClose, children, size = 'md' }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={clsx(
          'relative glass-strong rounded-3xl shadow-2xl w-full border border-white/20 animate-pop-in',
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 glass-card w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 hover:scale-110 z-10"
        >
          <X weight="bold" className="w-5 h-5" />
        </button>
        <div className="max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};