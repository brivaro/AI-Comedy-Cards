import React, { useState, useCallback } from 'react';
import { RoundPhase, User, Room, PlayerHandCard } from '../../types';
import { websocketService } from '../../services/websocketService';
import Scoreboard from '../game/Scoreboard';
import PlayerHand from '../game/PlayerHand';
import ThemeDisplay from '../game/ThemeDisplay';
import VotingDisplay from '../game/VotingDisplay';
import { Spinner } from '../ui/Spinner';
import { FIRST_PLACE_POINTS, SECOND_PLACE_POINTS, THIRD_PLACE_POINTS } from '../../constants';

interface GameBoardProps {
  onLeaveGame: () => void;
  currentUser: User;
  room: Room;
  myHand: PlayerHandCard[];
}

const GameBoard: React.FC<GameBoardProps> = ({ onLeaveGame, currentUser, room, myHand }) => {
  const [customThemeText, setCustomThemeText] = useState('');

  const myPlayerDetails = room.players.find(p => p.username === currentUser.username);
  const themeMaster = room.players.find(p => p.id === room.theme_master_id);
  const isThemeMaster = myPlayerDetails?.is_theme_master ?? false;
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const amSpectating = myPlayerDetails?.is_spectating ?? false;

  const showToast = useCallback((message: string) => {
      setToast({ message, show: true });
      setTimeout(() => setToast(prevState => ({ ...prevState, show: false })), 3000);
  }, []);
  
  const handlePlayCard = (playerCard: PlayerHandCard) => {
    websocketService.sendMessage('play_card', { player_card_id: playerCard.id });
  };

  const handleSelectWinners = (winnerIds: number[]) => {
    websocketService.sendMessage('select_winners', { winner_ids: winnerIds });
  };
  
  const handleRevealThemeCard = () => {
    websocketService.sendMessage('choose_theme_card', {});
  };

  const handleSubmitCustomTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (customThemeText.trim().includes('______') && customThemeText.trim().length > 10) {
      websocketService.sendMessage('submit_custom_theme', { text: customThemeText.trim() });
    } else {
      showToast("El tema debe incluir '______' y tener más de 10 caracteres.");
    }
  };

  const handleStartNextRound = () => {
    websocketService.sendMessage('start_next_round', {});
  };

  const renderMainArea = () => {
    if (amSpectating) {
      return (
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">¡Estás de espectador!</h2>
          <p className="text-gray-400 text-lg">
            La partida ya ha comenzado. Podrás jugar y recibirás tus cartas
            <br />
            <span className="font-bold text-brand-secondary">al inicio de la siguiente ronda.</span>
          </p>
          <Spinner text="Esperando..." />
        </div>
      );
    }

    switch (room.round_phase) {
      case RoundPhase.ThemeSelection:
        if (isThemeMaster) {
          return (
            <div className="text-center animate-fade-in w-full max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Tu turno, Maestro del Tema</h2>
              <p className="text-gray-400 mb-6">Elige una opción para la carta de tema de esta ronda.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Opción 1: Revelar carta de la IA */}
                <div className="flex flex-col items-center justify-center bg-gray-800/50 p-6 rounded-lg h-full">
                  <p className="mb-4">Dejar que la IA elija una carta de tema aleatoria.</p>
                  <button onClick={handleRevealThemeCard} className="bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-3 px-8 rounded-lg text-xl animate-pulse">
                    Revelar Tema de la IA
                  </button>
                </div>

                {/* Opción 2: Escribir tu propia carta */}
                <div className="flex flex-col items-center bg-gray-800/50 p-6 rounded-lg h-full">
                  <p className="mb-4">O... escribe tu propia carta de tema personalizada.</p>
                  <form onSubmit={handleSubmitCustomTheme} className="w-full space-y-3">
                    <textarea
                      value={customThemeText}
                      onChange={(e) => setCustomThemeText(e.target.value)}
                      placeholder="Ej: La verdadera razón por la que se extinguieron los dinosaurios fue ______."
                      className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 h-24 text-white"
                      required
                      minLength={10}
                    />
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold py-2 rounded-lg">
                      Usar mi Tema
                    </button>
                  </form>
                </div>
              </div>
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
      {/* Columna Izquierda */}
      <div className="w-full md:w-1-4 flex flex-col gap-4">
        <Scoreboard players={room.players} currentPlayerId={myPlayerDetails.id} />

        <div className="bg-gray-800/50 p-3 rounded-lg text-center border border-gray-700">
            <h4 className="font-bold text-sm text-gray-400 border-b border-gray-600 pb-1 mb-2">Configuración de la Partida</h4>
            <div className="text-xs space-y-1">
                <p><span className="font-semibold text-gray-300">IA:</span> {room.personality?.title ?? 'Desconocida'}</p>
            </div>
        </div>

        <button onClick={onLeaveGame} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold p-2 rounded">
            Salir de la Partida
        </button>
      </div>

      {/* Columna Derecha */}
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