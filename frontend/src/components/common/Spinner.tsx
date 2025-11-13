
import React from 'react';

interface SpinnerProps {
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-accent"></div>
      <p className="text-lg font-semibold text-brand-secondary">{text}</p>
    </div>
  );
};

export default Spinner;
