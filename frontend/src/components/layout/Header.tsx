import React from 'react';
import { SignOut, User as UserIcon } from 'phosphor-react';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo y Título Mejorado */}
        <div className="flex items-center gap-4">
          {/* Icono con efecto lava lamp */}
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/40 overflow-hidden">
            {/* Efecto lava lamp animado */}
            <div className="absolute inset-0 opacity-60">
              <div className="absolute w-20 h-20 bg-cyan-300 rounded-full blur-xl animate-[float_4s_ease-in-out_infinite]" 
                   style={{ top: '20%', left: '10%' }} />
              <div className="absolute w-16 h-16 bg-blue-400 rounded-full blur-xl animate-[float_5s_ease-in-out_infinite_0.5s]" 
                   style={{ bottom: '10%', right: '20%' }} />
              <div className="absolute w-12 h-12 bg-purple-400 rounded-full blur-xl animate-[float_6s_ease-in-out_infinite_1s]" 
                   style={{ top: '40%', right: '15%' }} />
            </div>
            <span className="text-5xl relative z-10">🎭</span>
          </div>
          
          {/* Título más grande con gradiente mejorado */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent leading-tight">
              AI Comedy Cards
            </h1>
            <p className="text-xs md:text-sm text-cyan-400/80 font-semibold tracking-wide">
              Humor generado por IA
            </p>
          </div>
        </div>

        {/* Usuario */}
        {username && (
          <div className="flex items-center gap-3">
            <div className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2.5 border border-cyan-500/30 hover:border-cyan-400/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" weight="bold" />
              </div>
              <span className="text-white font-bold text-sm hidden sm:block">{username}</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="glass-card p-2.5 rounded-xl border border-red-500/30 hover:border-red-400/50 hover:bg-red-500/10 transition-all group"
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