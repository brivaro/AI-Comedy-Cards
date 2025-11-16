import React from 'react';
import { Bug, Eye, IdentificationCard, GameController, ShieldWarning } from 'phosphor-react';
import { useDev } from '../../context/DevContext';
import { GameState } from '../../types';

export const DevPanel: React.FC = () => {
  const { 
    isDevMode, 
    toggleDevMode, 
    currentView, 
    setCurrentView,
    isHost,
    toggleIsHost,
    isThemeMaster,
    toggleIsThemeMaster,
    roundPhase,
    setRoundPhase
  } = useDev();

  if (!isDevMode) {
    return (
      <button
        onClick={toggleDevMode}
        className="fixed bottom-4 left-4 z-[200] w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform"
        title="Enable Developer Mode"
      >
        <Bug className="w-7 h-7 text-white" weight="bold" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[200] glass-strong p-4 rounded-2xl border-2 border-purple-500/50 shadow-2xl max-w-sm w-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bug className="w-6 h-6 text-purple-400" weight="bold" />
          <h3 className="font-bold text-lg text-white">Dev Panel</h3>
        </div>
        <button onClick={toggleDevMode} className="text-gray-400 hover:text-white">
          <Eye className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
            <label className="text-sm font-semibold text-gray-300">Vista Actual</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
                <button onClick={() => setCurrentView(GameState.MainMenu)} className={`btn-dev ${currentView === GameState.MainMenu && 'active'}`}><IdentificationCard/> MainMenu</button>
                <button onClick={() => setCurrentView(GameState.Lobby)} className={`btn-dev ${currentView === GameState.Lobby && 'active'}`}><IdentificationCard/> Lobby</button>
                <button onClick={() => setCurrentView(GameState.InGame)} className={`btn-dev ${currentView === GameState.InGame && 'active'}`}><GameController/> GameBoard</button>
                <button onClick={() => setCurrentView(null as any)} className={`btn-dev ${currentView === null && 'active'}`}><ShieldWarning/> Disclaimer</button>
            </div>
        </div>

        {currentView === GameState.InGame && (
          <div>
            <label className="text-sm font-semibold text-gray-300">Fase de Ronda</label>
            <select 
              value={roundPhase} 
              onChange={e => setRoundPhase(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 rounded-md p-2 mt-1 text-white"
            >
              <option value="ThemeSelection">ThemeSelection</option>
              <option value="CardPlaying">CardPlaying</option>
              <option value="Voting">Voting</option>
              <option value="RoundOver">RoundOver</option>
            </select>
          </div>
        )}

        <div>
            <label className="text-sm font-semibold text-gray-300">Roles</label>
            <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-2 text-white cursor-pointer"><input type="checkbox" checked={isHost} onChange={toggleIsHost} /> Es Host</label>
                <label className="flex items-center gap-2 text-white cursor-pointer"><input type="checkbox" checked={isThemeMaster} onChange={toggleIsThemeMaster} /> Es Theme Master</label>
            </div>
        </div>
      </div>
       <style>{`
        .btn-dev {
          @apply flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-700 text-white text-xs font-bold transition-all hover:bg-slate-600;
        }
        .btn-dev.active {
          @apply bg-gradient-to-r from-purple-500 to-indigo-500 ring-2 ring-white;
        }
      `}</style>
    </div>
  );
};