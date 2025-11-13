import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, show }) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Corresponds to the toast-out animation duration
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg shadow-lg z-50 ${
        show ? 'animate-toast-in' : 'animate-toast-out'
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;
