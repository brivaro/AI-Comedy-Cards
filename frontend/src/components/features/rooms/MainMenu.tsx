import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as apiService from '../../../services/apiService';
import { Plus, SignIn, FolderOpen } from 'phosphor-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';
import { Room } from '../../../types';
import { AuthForm } from '../../features/auth/AuthForm';
import MyTopics from '../topics/MyTopics';

interface MainMenuProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onRoomConnected?: (room: Room) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ showToast, onRoomConnected }) => {
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  
  const { login, register, user } = useAuth();

  const handleAuthAction = async (action: 'login' | 'register', username: string, password: string) => {
    setIsLoading(true);
    try {
      if (action === 'register') {
        await register({ username, password });
        showToast('¡Cuenta creada con éxito!', 'success');
      } else {
        await login(username, password);
        showToast(`¡Bienvenido, ${username}!`, 'success');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error de autenticación';
      showToast(errorMsg, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.createRoom();
      onRoomConnected?.(response.data);
      showToast('¡Sala creada con éxito!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Error al crear la sala', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsLoading(true);
    try {
      const response = await apiService.joinRoom(joinCode.trim().toUpperCase());
      onRoomConnected?.(response.data);
      showToast('¡Te has unido a la sala!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Error al unirse a la sala', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <AuthForm
        onLogin={(u, p) => handleAuthAction('login', u, p)}
        onRegister={(u, p) => handleAuthAction('register', u, p)}
        isLoading={isLoading}
      />
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center w-full px-4 animate-fade-in">
        <div className="w-full max-w-md">
          {/* Usamos glass-strong para un efecto más destacado */}
          <Card className="glass-strong p-8 border-2 border-cyan-500/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text mb-2">
                ¡Hora de Jugar, {user.username}!
              </h2>
              <p className="text-gray-300">¿Qué quieres hacer hoy?</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleCreateRoom}
                variant="primary"
                size="lg"
                isLoading={isLoading}
                icon={<Plus weight="bold" />}
                className="w-full"
              >
                Crear Sala Nueva
              </Button>

              <Button
                onClick={() => setShowTopicsModal(true)}
                variant="secondary"
                size="lg"
                icon={<FolderOpen weight="bold" />}
                className="w-full"
              >
                Gestionar Mis Temas
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-brand-primary text-gray-400 font-semibold">O</span>
                </div>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-4">
                <Input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode((e.target as HTMLInputElement).value.toUpperCase())}
                  placeholder="CÓDIGO DE SALA"
                  maxLength={6}
                  className="text-center tracking-[0.3em] text-2xl font-bold uppercase"
                  icon={<SignIn className="w-5 h-5" weight="bold" />}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Unirse a Sala
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>

      {showTopicsModal && (
        <MyTopics 
          onClose={() => setShowTopicsModal(false)}
          showToast={showToast}
        />
      )}
    </>
  );
};