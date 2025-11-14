import React from 'react';
import clsx from 'clsx';

interface CardProps {
  text?: string;
  isSelectable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  text, 
  isSelectable = false, 
  className = '', 
  children 
}) => {
  const baseClasses = "rounded-2xl shadow-2xl flex flex-col justify-between transition-all duration-300";
  
  // Siempre usamos el estilo glass, eliminamos la lógica del color.
  const styleClasses = 'glass-card text-white border border-white/10';

  const selectableClasses = isSelectable 
    ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/40 hover:border-cyan-500/50 active:scale-95' 
    : '';

  // Clases de tamaño por defecto si la tarjeta tiene texto (carta de juego)
  const sizeClasses = text ? 'w-48 h-64 p-6' : '';

  return (
    <div className={clsx(baseClasses, styleClasses, selectableClasses, sizeClasses, className)}>
      {text ? (
        <>
          <p className="font-bold text-lg leading-tight flex-grow">{text}</p>
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