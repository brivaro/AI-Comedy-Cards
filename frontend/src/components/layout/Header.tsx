import React from 'react';
import { SignOut, User as UserIcon } from 'phosphor-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo y Título */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-float">
            <span className="text-2xl">🎭</span>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Comedy Cards
            </h1>
            <p className="text-xs text-gray-400 font-medium">Humor generado por IA</p>
          </div>
        </div>

        {/* Usuario */}
        {username && (
          <div className="flex items-center gap-3">
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-purple-400" weight="bold" />
              <span className="text-white font-semibold">{username}</span>
            </div>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                icon={<SignOut weight="bold" />}
                onClick={onLogout}
                className="!p-2"
              />
            )}
          </div>
        )}
      </div>
    </header>
  );
};