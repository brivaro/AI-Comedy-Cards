import React, { useState, useEffect } from 'react';
import { PlayedCardInfo } from '../../types';
import { Card } from './Card';

interface VotingDisplayProps {
  playedCards: PlayedCardInfo[];
  onSelectWinners: (winnerIds: number[]) => void;
}

const VotingDisplay: React.FC<VotingDisplayProps> = ({ playedCards, onSelectWinners }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const maxWinners = Math.min(3, playedCards.length);

  useEffect(() => {
    setSelectedIds([]);
  }, [playedCards]);

  const handleSelectCard = (playerId: number) => {
    if (selectedIds.includes(playerId)) {
      setSelectedIds(prev => prev.filter(id => id !== playerId));
    } else if (selectedIds.length < maxWinners) {
      setSelectedIds(prev => [...prev, playerId]);
    }
  };

  const getMedal = (index: number) => ['🥇', '🥈', '🥉'][index] || '';

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">
        {maxWinners > 0 ? `Elige a ${maxWinners > 1 ? `los ${maxWinners} ganadores` : 'el ganador'}` : 'No hay cartas que votar'}
      </h2>
      <p className="text-gray-400 mb-6">
        {maxWinners > 0 && 'El primer clic es 1er lugar, el segundo 2do, etc.'}
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {playedCards.map((card) => {
          const selectionIndex = selectedIds.indexOf(card.playerId);
          const isSelected = selectionIndex !== -1;
          const canSelect = selectedIds.length < maxWinners || isSelected;

          return (
            <div key={card.playerId} className="relative" onClick={() => canSelect && handleSelectCard(card.playerId)}>
              <Card text={card.cardText} isSelectable={canSelect} />
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center ring-2 ring-white">
                  {getMedal(selectionIndex)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedIds.length > 0 && (
        <button 
            onClick={() => onSelectWinners(selectedIds)} 
            className="mt-8 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-3 px-8 rounded-lg text-xl animate-pop-in"
        >
            Confirmar {selectedIds.length} {selectedIds.length > 1 ? 'Ganadores' : 'Ganador'}
        </button>
      )}
    </div>
  );
};

export default VotingDisplay;