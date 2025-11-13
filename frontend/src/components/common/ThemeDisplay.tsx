import React from 'react';
import { Card as CardComponent } from './Card';
import { Card } from '../../types';

interface ThemeDisplayProps {
  themeCard: Card | null;
  themeMasterName?: string;
}

const ThemeDisplay: React.FC<ThemeDisplayProps> = ({ themeCard, themeMasterName }) => {
  return (
    <div className="flex justify-center">
      <CardComponent color="black" className="p-4 min-h-[8rem] w-full max-w-lg">
        {themeCard ? (
          <>
            <p className="text-xl md:text-2xl font-bold text-center" dangerouslySetInnerHTML={{ __html: themeCard.text.replace(/______/g, '<span class="text-brand-accent">______</span>') }}></p>
            <p className="text-xs text-gray-500 mt-2 self-start">Tema de: {themeMasterName}</p>
          </>
        ) : (
          <p className="text-lg text-gray-500">Esperando el tema...</p>
        )}
      </CardComponent>
    </div>
  );
};

export default ThemeDisplay;