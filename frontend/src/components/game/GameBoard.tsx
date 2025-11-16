import React, { useEffect, useState, useCallback } from 'react';
import { SignOut, Crown, Trophy, Users, Robot, Star, Repeat } from 'phosphor-react';
import { Room, User, PlayerHandCard, RoundPhase } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import PlayerHand from './PlayerHand';
import ThemeDisplay from './ThemeDisplay';
import VotingDisplay from './VotingDisplay';
import { websocketService } from '../../services/websocketService';
import { FIRST_PLACE_POINTS, SECOND_PLACE_POINTS, THIRD_PLACE_POINTS } from '../../constants';
import { Toast } from '../ui/Toast';
import GameOverModal from './GameOverModal';

interface GameBoardProps {
  room: Room;
  currentUser: User;
  myHand: PlayerHandCard[];
  onLeaveGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ room, currentUser, myHand, onLeaveGame }) => {
  const [customThemeText, setCustomThemeText] = useState('');
  const [toast, setToast] = useState<{ message: string; show: boolean; type: 'success' | 'error' | 'info' }>({
    message: '',
    show: false,
    type: 'info'
  });
  const [showGameOver, setShowGameOver] = useState(false);

  const myPlayerDetails = room.players.find(p => p.username === currentUser.username);
  const themeMaster = room.players.find(p => p.id === room.theme_master_id);
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const isThemeMaster = myPlayerDetails?.is_theme_master ?? false;
  const amSpectating = myPlayerDetails?.is_spectating ?? false;

  useEffect(() => {
    if (room.game_state === 'Finished') {
      // Usamos un pequeño delay para que la transición sea más suave
      const timer = setTimeout(() => setShowGameOver(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowGameOver(false);
    }
  }, [room.game_state]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, show: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
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
    if (customThemeText.trim().length > 10) {
      websocketService.sendMessage('submit_custom_theme', { text: customThemeText.trim() });
    } else {
      showToast("El tema debe incluir más de 10 caracteres.", 'error');
    }
  };

  const handleStartNextRound = () => {
    websocketService.sendMessage('start_next_round', {});
  };

  const renderMainArea = () => {
    if (amSpectating) {
      return (
        <div className="text-center animate-fade-in">
          <Spinner text="Estás en modo espectador..." size="sm" />
          <p className="text-gray-400 text-lg mt-4">
            ¡Podrás unirte a la acción en la siguiente ronda!
          </p>
        </div>
      );
    }

    switch (room.round_phase) {
      case RoundPhase.ThemeSelection:
        if (isThemeMaster) {
          return (
            <div className="text-center animate-fade-in w-full max-w-4xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Tu turno, Maestro del Tema</h2>
              <p className="text-gray-400 mb-4 sm:mb-6">Elige una opción para la carta de tema de esta ronda.</p>

              {/* LAYOUT CORREGIDO: ahora es flex-col y en pantallas md pasa a flex-row */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <div className="glass-card p-4 md:p-6 rounded-2xl flex flex-col items-center justify-between border-2 border-cyan-500/20 flex-1">
                  <p className="mb-4 text-center text-sm sm:text-base">Dejar que la IA elija una carta de tema aleatoria.</p>
                  <Button onClick={handleRevealThemeCard} variant="primary" size="md" className="animate-pulse-slow w-full">
                    Revelar Tema de la IA
                  </Button>
                </div>
                <div className="glass-card p-4 md:p-6 rounded-2xl flex flex-col items-center border-2 border-blue-500/20 flex-1">
                  <p className="mb-4 text-center text-sm sm:text-base">O... escribe tu propia carta de tema.</p>
                  <form onSubmit={handleSubmitCustomTheme} className="w-full space-y-3 flex flex-col flex-grow">
                    <textarea
                      value={customThemeText}
                      onChange={(e) => setCustomThemeText(e.target.value)}
                      placeholder="Ej: La verdadera razón por la que se extinguieron los dinosaurios fue ______."
                      className="w-full bg-slate-900/90 backdrop-blur-xl border-2 border-slate-600/50 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm flex-grow min-h-[80px]"
                      required minLength={10}
                    />
                    <Button type="submit" variant="secondary" size="md" className="w-full">
                      Usar mi Tema
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          );
        }
        return <Spinner text={`Esperando a que ${themeMaster?.username} elija el tema...`} size="sm" />;

      case RoundPhase.CardPlaying:
        if (isThemeMaster) {
          return <Spinner text="Espera a que los demás jueguen sus cartas..." size="sm" />;
        }
        if (myPlayerDetails?.has_played) {
          return <Spinner text="¡Buena jugada! Esperando al resto de jugadores..." size="sm" />;
        }
        return <PlayerHand cards={myHand} onPlayCard={handlePlayCard} />;

      case RoundPhase.Voting:
        if (isThemeMaster) {
          return <VotingDisplay playedCards={room.played_cards_info} onSelectWinners={handleSelectWinners} />;
        }
        return <Spinner text={`Esperando a que ${themeMaster?.username} elija a los ganadores...`} size="sm" />;

      case RoundPhase.RoundOver:
        const winners = room.round_winners.map(id => room.players.find(p => p.id === id)).filter(Boolean);
        const points = [FIRST_PLACE_POINTS, SECOND_PLACE_POINTS, THIRD_PLACE_POINTS];
        const medals = ['🥇', '🥈', '🥉'];

        return (
          <div className="text-center animate-pop-in">
            <h2 className="text-3xl font-bold text-white mb-4">¡Ronda Finalizada!</h2>
            <div className="space-y-2 text-xl mb-6 max-w-md mx-auto">
              {winners.map((winner, index) => winner && (
                <div key={winner.id} className="glass-card p-3 rounded-xl flex items-center justify-center gap-4">
                  <span className="text-3xl">{medals[index]}</span>
                  <span className="text-white text-lg font-semibold">{winner.username}</span>
                  <span className="font-bold text-yellow-400">(+{points[index]} pts)</span>
                </div>
              ))}
            </div>
            {isThemeMaster && (
              <Button onClick={handleStartNextRound} variant="primary" size="lg">
                Comenzar Siguiente Ronda
              </Button>
            )}
            {!isThemeMaster && <Spinner text="El Maestro del Tema iniciará la siguiente ronda..." size="sm" />}
          </div>
        );

      default:
        return <Spinner text="Cargando estado de la partida..." size="md" />;
    }
  };

  if (!myPlayerDetails) return <div className="min-h-screen flex items-center justify-center"><Spinner text="Sincronizando jugador..." /></div>;

  return (
    <>
      {showGameOver && (
        <GameOverModal
          room={room}
          currentUser={currentUser}
          onClose={onLeaveGame} // Reutilizamos la función de salir para volver al menú
        />
      )}
      <div className="w-full min-h-[calc(100vh-180px)] lg:h-[calc(100vh-180px)] grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">  
        <div className="lg:col-span-1 flex flex-col gap-4 ">
          <Card className="glass-card p-4 rounded-2xl flex-1 flex flex-col ">
            <h3 className="text-base font-bold text-white mb-3 pb-2 border-b border-cyan-500/20 flex items-center gap-2 flex-shrink-0">
              <Trophy className="w-5 h-5 text-cyan-400" weight="bold" /> PUNTUACIONES
            </h3>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent pr-2 space-y-2">
              {sortedPlayers.map((player) => (
                <div key={player.id} className={`rounded-xl p-3 transition-all ${player.username === currentUser.username ? 'glass-strong border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20' : 'glass-card border border-slate-600/30'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {player.is_host && <Crown className="w-4 h-4 text-yellow-400" weight="bold" />}
                        {player.is_theme_master && <Star className="w-4 h-4 text-purple-400" weight="bold" />}
                        <span className={`font-bold text-sm truncate ${player.username === currentUser.username ? 'text-cyan-300' : 'text-white'}`}>{player.username}</span>
                      </div>
                    </div>
                    {!player.is_spectating && (<span className="font-black text-xl text-yellow-400 flex-shrink-0">{player.score}</span>)}
                  </div>
                  {player.is_spectating && (<span className="text-xs text-center block text-gray-400 font-medium mt-1">Esperando para jugar...</span>)}
                </div>
              ))}
            </div>
          </Card>
          <Button onClick={onLeaveGame} variant="danger" size="md" icon={<SignOut weight="bold" />} className="w-full flex-shrink-0">
            Salir de la Partida
          </Button>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-3 md:gap-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="glass-card p-3 rounded-2xl border border-cyan-500/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-cyan-400" weight="bold" /></div>
              <div className="flex-1 min-w-0"><p className="text-xs text-gray-400">Sala</p><p className="text-base sm:text-lg font-black text-cyan-300 tracking-wider">{room.code}</p></div>
            </Card>
            <Card className="glass-card p-3 rounded-2xl border border-purple-500/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0"><Star className="w-5 h-5 text-purple-400" weight="bold" /></div>
              <div className="flex-1 min-w-0"><p className="text-xs text-gray-400">Maestro del Tema</p><p className="text-base sm:text-lg font-bold text-white truncate">{themeMaster?.username || "..."}</p></div>
            </Card>
            <Card className="glass-card p-3 rounded-2xl border border-blue-500/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0"><Robot className="w-5 h-5 text-blue-400" weight="bold" /></div>
              <div className="flex-1 min-w-0"><p className="text-xs text-gray-400">Personalidad IA</p><p className="text-base sm:text-lg font-bold text-white truncate">{room.personality?.title || "..."}</p></div>
            </Card>
            <Card className="glass-card p-3 rounded-2xl border border-yellow-500/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0"><Trophy className="w-5 h-5 text-yellow-400" weight="bold" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">Ronda</p>
                <p className="text-base sm:text-lg font-black text-white">
                  {room.current_round} <span className="text-gray-400">/</span> {room.total_rounds}
                </p>
              </div>
            </Card>
          </div>

          <ThemeDisplay themeCard={room.current_theme_card} themeMasterName={themeMaster?.username} />

          <Card className="glass-strong rounded-2xl border-2 border-cyan-500/10 flex-1 min-h-0 ">
            <div className="h-full w-full overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
              <div className="flex items-center justify-center min-h-full">
                {renderMainArea()}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Toast message={toast.message} show={toast.show} type={toast.type} />
    </>
  );
};

export default GameBoard;