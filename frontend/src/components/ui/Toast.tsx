import React, { useEffect, useState } from 'react';
import { CheckCircle, WarningCircle, Info, X } from 'phosphor-react';
import clsx from 'clsx';

interface ToastProps {
  message: string;
  show: boolean;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, show, type = 'info', onClose }) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5" weight="bold" />,
    error: <WarningCircle className="w-5 h-5" weight="bold" />,
    info: <Info className="w-5 h-5" weight="bold" />
  };

  const colors = {
    success: 'from-green-500/90 to-emerald-500/90 border-green-400/50',
    error: 'from-red-500/90 to-rose-500/90 border-red-400/50',
    info: 'from-cyan-500/90 to-blue-500/90 border-cyan-400/50'
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center p-4 pointer-events-none z-[100]">
      <div
        className={clsx(
          'pointer-events-auto glass-strong rounded-2xl shadow-2xl border max-w-md w-full',
          'bg-gradient-to-r backdrop-blur-2xl',
          colors[type],
          show ? 'animate-toast-in' : 'animate-toast-out'
        )}
      >
        <div className="flex items-center gap-3 p-4">
          <div className="flex-shrink-0 text-white">
            {icons[type]}
          </div>
          <p className="flex-1 text-white font-medium text-sm">{message}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};