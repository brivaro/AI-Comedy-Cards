import React from 'react';
import { SignOut, Crown, Trophy, Users } from 'phosphor-react';

// Simulación de componentes
const Card = ({ className, children }: any) => <div className={className}>{children}</div>;
const Button = ({ children, onClick, variant, size, icon, className }: any) => {
  const variants: Record<string, string> = {
    danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400',
    primary: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
  };
  return ( 
    <button onClick={onClick} className={`font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${variants[variant]} px-4 py-3 text-white ${className}`}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

interface Player {
  id: number;
  username: string;
  score: number;
  is_host: boolean;
  is_theme_master: boolean;
  has_played: boolean;
  is_spectating: boolean;
}

interface GameBoardProps {
  room: {
    code: string;
    current_theme_card: { text: string } | null;
    personality: { title: string } | null;
    players: Player[];
    theme_master_id: number | null;
  };
  currentUser: {
    id: number;
    username: string;
  };
  onLeaveGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ room, currentUser, onLeaveGame }) => {
  const myPlayerDetails = room.players.find(p => p.id === currentUser.id);
  const themeMaster = room.players.find(p => p.id === room.theme_master_id);
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col gap-4 animate-fade-in">
      {/* Header superior compacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Info de sala */}
        <Card className="glass-card p-4 rounded-2xl border border-cyan-500/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-cyan-400" weight="bold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">Sala</p>
            <p className="text-lg font-black text-cyan-300 tracking-wider">{room.code}</p>
          </div>
        </Card>

        {/* Maestro del tema */}
        <Card className="glass-card p-4 rounded-2xl border border-yellow-500/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-yellow-400" weight="bold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">Maestro del Tema</p>
            <p className="text-lg font-bold text-white truncate">{themeMaster?.username || "..."}</p>
          </div>
        </Card>

        {/* Personalidad IA */}
        <Card className="glass-card p-4 rounded-2xl border border-blue-500/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🤖</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">IA</p>
            <p className="text-lg font-bold text-white truncate">{room.personality?.title || "..."}</p>
          </div>
        </Card>
      </div>

      {/* Área principal del juego */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 min-h-0">
        {/* Sidebar de puntuaciones - más compacto */}
        <div className="md:col-span-1 flex flex-col gap-3 overflow-hidden">
          <Card className="glass-card p-4 rounded-2xl border border-cyan-500/10 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-base font-bold text-white mb-3 pb-2 border-b border-cyan-500/20 flex items-center gap-2 flex-shrink-0">
              <Users className="w-5 h-5 text-cyan-400" weight="bold" />
              PUNTUACIONES
            </h3>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent pr-2 space-y-2">
              {sortedPlayers.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`rounded-xl p-3 transition-all ${
                    player.id === currentUser.id 
                      ? 'glass-strong border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                      : 'glass-card border border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {index < 3 && (
                        <span className="text-lg flex-shrink-0">
                          {['🥇', '🥈', '🥉'][index]}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {player.is_host && <span className="text-xs">👑</span>}
                          {player.is_theme_master && <span className="text-xs">🎯</span>}
                          <span className={`font-bold text-sm truncate ${
                            player.id === currentUser.id ? 'text-cyan-300' : 'text-white'
                          }`}>
                            {player.username}
                          </span>
                        </div>
                        {player.is_spectating && (
                          <span className="text-xs text-gray-400 font-medium">Esperando...</span>
                        )}
                      </div>
                    </div>
                    {!player.is_spectating && (
                      <span className="font-black text-xl text-yellow-400 flex-shrink-0">{player.score}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Button
            onClick={onLeaveGame}
            variant="danger"
            size="md"
            icon={<SignOut weight="bold" />}
            className="w-full flex-shrink-0"
          >
            Salir
          </Button>
        </div>

        {/* Área de juego principal */}
        <div className="md:col-span-3 flex flex-col gap-4 min-h-0">
          {/* Carta de tema */}
          <Card className="glass-card p-6 rounded-2xl border-2 border-cyan-500/20 flex-shrink-0">
            {room.current_theme_card ? (
              <div>
                <p 
                  className="text-2xl md:text-3xl font-bold text-center text-white leading-tight"
                  dangerouslySetInnerHTML={{ 
                    __html: room.current_theme_card.text.replace(
                      /______/g, 
                      '<span class="text-cyan-400 px-2 border-b-4 border-cyan-400/50">______</span>'
                    )
                  }}
                />
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Tema por: {themeMaster?.username}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xl text-gray-400">Esperando el tema...</p>
              </div>
            )}
          </Card>

          {/* Área de acción principal */}
          <Card className="glass-strong rounded-2xl border-2 border-cyan-500/10 flex-1 min-h-0 overflow-hidden">
            <div className="h-full flex items-center justify-center p-6">
              {/* Aquí irían los diferentes estados del juego */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎮</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Área de Juego</h3>
                <p className="text-gray-400">
                  Aquí se mostrarán las cartas, votaciones y acciones del juego
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;