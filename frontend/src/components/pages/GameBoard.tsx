import React from 'react';
import { RoundPhase, User, Room, PlayerHandCard } from '../../types';
import { websocketService } from '../../services/websocketService';
import Scoreboard from '../common/Scoreboard';
import PlayerHand from '../common/PlayerHand';
import ThemeDisplay from '../common/ThemeDisplay';
import VotingDisplay from '../common/VotingDisplay';
import Spinner from '../common/Spinner';
import { FIRST_PLACE_POINTS, SECOND_PLACE_POINTS, THIRD_PLACE_POINTS } from '../../constants';

interface GameBoardProps {
  onLeaveGame: () => void;
  currentUser: User;
  room: Room;
  myHand: PlayerHandCard[];
}

const GameBoard: React.FC<GameBoardProps> = ({ onLeaveGame, currentUser, room, myHand }) => {
  const myPlayerDetails = room.players.find(p => p.username === currentUser.username);
  const themeMaster = room.players.find(p => p.id === room.theme_master_id);
  const isThemeMaster = myPlayerDetails?.is_theme_master ?? false;
  
  const handlePlayCard = (playerCard: PlayerHandCard) => {
    websocketService.sendMessage('play_card', { player_card_id: playerCard.id });
  };

  const handleSelectWinners = (winnerIds: number[]) => {
    websocketService.sendMessage('select_winners', { winner_ids: winnerIds });
  };
  
  const handleRevealThemeCard = () => {
    websocketService.sendMessage('choose_theme_card', {});
  };

  const handleStartNextRound = () => {
    websocketService.sendMessage('start_next_round', {});
  };

  const renderMainArea = () => {
    switch (room.round_phase) {
      case RoundPhase.ThemeSelection:
        if (isThemeMaster) {
          return (
            <div className="text-center animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">Tu turno, Maestro del Tema</h2>
              <p className="text-gray-400 mb-6">Presiona el botón para revelar la carta de tema.</p>
              <button onClick={handleRevealThemeCard} className="bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-3 px-8 rounded-lg text-xl animate-pulse">
                Revelar Tema
              </button>
            </div>
          );
        }
        return <p className="text-2xl text-gray-400">Esperando a que {themeMaster?.username} revele el tema...</p>;
      
      case RoundPhase.CardPlaying:
        if (isThemeMaster) {
          return <p className="text-2xl text-gray-400">Espera a que los demás jueguen sus cartas...</p>;
        }
        if (myPlayerDetails?.has_played) {
          return <p className="text-2xl text-gray-400">¡Jugada hecha! Esperando al resto...</p>;
        }
        return <PlayerHand cards={myHand} onPlayCard={handlePlayCard} />;
      
      case RoundPhase.Voting:
        if (isThemeMaster) {
            return <VotingDisplay playedCards={room.played_cards_info} onSelectWinners={handleSelectWinners} />;
        }
        return <p className="text-2xl text-gray-400">Esperando a que {themeMaster?.username} elija a los ganadores...</p>;
      
      case RoundPhase.RoundOver:
        const winners = room.round_winners.map(id => room.players.find(p => p.id === id)).filter(Boolean);
        const points = [FIRST_PLACE_POINTS, SECOND_PLACE_POINTS, THIRD_PLACE_POINTS];
        const medals = ['🥇', '🥈', '🥉'];
        
        return (
          <div className="text-center animate-pop-in">
            <h2 className="text-3xl font-bold mb-4">¡Ronda terminada!</h2>
            <div className="space-y-2 text-xl mb-6">
              {winners.map((winner, index) => winner && (
                <p key={winner.id}>{medals[index]} {winner.username} (+{points[index]} pts)</p>
              ))}
            </div>
            {isThemeMaster && (
              <button onClick={handleStartNextRound} className="bg-brand-accent hover:bg-brand-accent-hover p-3 rounded-lg text-xl">
                Empezar Siguiente Ronda
              </button>
            )}
          </div>
        );

      default:
        return <Spinner text="Cargando estado del juego..."/>;
    }
  };

  if (!myPlayerDetails) return <Spinner text="Sincronizando jugador..." />;
  
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 animate-fade-in">
      <div className="w-full md:w-1/4 flex flex-col gap-4">
        <Scoreboard players={room.players} currentPlayerId={myPlayerDetails.id} />
        <button onClick={onLeaveGame} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold p-2 rounded">
            Salir de la Partida
        </button>
      </div>

      <div className="w-full md:w-3/4 flex flex-col gap-4">
        <ThemeDisplay themeCard={room.current_theme_card} themeMasterName={themeMaster?.username} />
        <div className="flex-grow bg-gray-900/50 rounded-lg p-4 flex items-center justify-center min-h-[20rem]">
          {renderMainArea()}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;