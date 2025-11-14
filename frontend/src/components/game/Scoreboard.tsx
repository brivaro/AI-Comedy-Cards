import React from 'react';
import { Player } from '../../types';
import { Card } from '../ui/Card';

interface ScoreboardProps {
  players: Player[];
  currentPlayerId?: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, currentPlayerId }) => {
  return (
    <Card color="black" className="p-4 h-full">
      <h3 className="text-xl font-bold mb-4 text-center border-b border-gray-600 pb-2">Puntuaciones</h3>
      <ul className="space-y-3">
        {players.map((player) => (
            <li key={player.id} className={`flex justify-between items-center bg-gray-700 p-2 rounded-md ${currentPlayerId === player.id ? 'ring-2 ring-brand-accent' : ''}`}>
              <span className="font-semibold truncate">
                {player.is_host && '👑 '}
                {player.is_theme_master && '🎓 '}
                {player.username}
              </span>
              {player.is_spectating ? (
                <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded">ESPERANDO</span>
              ) : (
                <span className="font-bold text-lg text-yellow-400">{player.score}</span>
              )}
            </li>
          ))}
      </ul>
    </Card>
  );
};

export default Scoreboard;