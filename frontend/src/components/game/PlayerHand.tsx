import React from 'react';
import { PlayerHandCard } from '../../types';
import { Card } from '../ui/Card';

interface PlayerHandProps {
  cards: PlayerHandCard[];
  onPlayCard: (playerCard: PlayerHandCard) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ cards, onPlayCard }) => {
  return (
    <div className="flex overflow-x-auto gap-4 px-4 py-2 w-full scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
      {cards.map((playerCard) => (
        <div key={playerCard.id} onClick={() => onPlayCard(playerCard)} className="flex-shrink-0">
          <Card 
            text={playerCard.card.text} 
            isSelectable={true}
          />
        </div>
      ))}
    </div>
  );
};

export default PlayerHand;