import React from 'react';
import { SignOut, User as UserIcon } from 'phosphor-react';
import clsx from 'clsx';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
  variant?: 'glass' | 'solid';
}

export const Header: React.FC<HeaderProps> = ({ username, onLogout, variant = 'glass' }) => {
  const isGlass = variant === 'glass';

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className={clsx("absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent", isGlass && "backdrop-blur-2xl")}></div>
      <div className={clsx("absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent", isGlass ? "via-cyan-500/50" : "via-slate-800")}></div>
      
      <div className="relative w-full px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <span className="text-5xl relative z-10 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">🎭</span>
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight drop-shadow-[0_0_30px_rgba(34,211,238,0.5)] tracking-tight">
              CardsAI
            </h1>
            <p className="text-xs md:text-sm text-cyan-300 font-bold tracking-wider drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Crea y juega con amigos
            </p>
          </div>
        </div>

        {/* Usuario */}
        {username && (
          <div className="flex items-center gap-3">
            <div className={clsx(
              "px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition-all",
              isGlass 
                ? 'glass-card border border-cyan-500/30 hover:border-cyan-400/50' 
                : 'bg-slate-900/50 border border-slate-700/50'
            )}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" weight="bold" />
              </div>
              <span className="text-white font-bold text-sm hidden sm:block">{username}</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className={clsx(
                  "p-2.5 rounded-xl transition-all group",
                  isGlass ? 'glass-card border border-red-500/30 hover:border-red-400/50 hover:bg-red-500/10' : 'bg-slate-900/50 border border-red-500/30 hover:bg-red-500/20'
                )}
              >
                <SignOut className="w-5 h-5 text-red-400 group-hover:text-red-300" weight="bold" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};