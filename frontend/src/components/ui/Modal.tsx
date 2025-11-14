import React, { useEffect } from 'react';
import { X } from 'phosphor-react';
import ReactDOM from 'react-dom';

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

  const modalContent = (
    <div 
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className={`relative glass-strong rounded-3xl shadow-2xl w-full border-2 border-cyan-500/20 animate-pop-in my-auto flex flex-col max-h-[90vh] ${sizes[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
          {children}
        </div>
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 glass-card w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 hover:scale-110 z-10 border-2 border-red-500/30 group"
        >
          <X weight="bold" className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};