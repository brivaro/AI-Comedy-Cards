import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as apiService from '../../services/apiService';
import { Card } from '../common/Card';
import { Room } from '../../types';
import MyTopics from '../common/MyTopics';
import Spinner from '../common/Spinner';

interface MainMenuProps {
  showToast: (message: string) => void;
  onRoomConnected?: (room: Room) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ showToast, onRoomConnected }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);  
  
  const { login, register, user, logout } = useAuth();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegistering) {
        await register({ username, password });
        showToast('¡Registro exitoso! Ya puedes jugar.');
      } else {
        await login(username, password);
        showToast('¡Has iniciado sesión!');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Error de autenticación. Inténtalo de nuevo.';
      showToast(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.createRoom();
      onRoomConnected?.(response.data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Error al crear la sala.");
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
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Error al unirse a la sala.");
    } finally {
      setIsLoading(false);
    }
  };

  // VISTA PARA USUARIOS NO LOGUEADOS (FORMULARIO DE AUTH)
  if (!user) {
    return (
      <div className="w-full max-w-sm mx-auto animate-fade-in">
        <Card color="black" className="p-8">
          <h2 className="text-3xl font-bold text-center mb-6">{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nombre de usuario" required minLength={3} className="w-full bg-gray-800 rounded-lg p-3" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" required minLength={8} className="w-full bg-gray-800 rounded-lg p-3" />
            <button type="submit" disabled={isLoading} className="w-full bg-brand-accent hover:bg-brand-accent-hover font-bold py-3 rounded-lg text-lg disabled:bg-gray-600">
              {isLoading ? <Spinner text="Cargando..." /> : (isRegistering ? 'Registrarse' : 'Entrar')}
            </button>
          </form>
          <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-4 text-center text-sm text-gray-400 hover:text-white">
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </Card>
      </div>
    );
  }

  // VISTA PARA USUARIOS LOGUEADOS
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card color="black" className="p-8 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-center">¡Hola, {user.username}!</h2>
            <button onClick={logout} className="text-sm bg-red-800 hover:bg-red-700 p-2 rounded">Salir</button>
        </div>
        
        <div>
          <button onClick={handleCreateRoom} disabled={isLoading} className="mt-2 w-full bg-brand-accent hover:bg-brand-accent-hover font-bold py-3 rounded-lg disabled:bg-gray-600">
            {isLoading ? 'Creando...' : 'Crear Sala'}
          </button>
        </div>

        <button onClick={() => setShowTopicsModal(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold py-3 rounded-lg">
          Gestionar Mis Temas
        </button>

        <div className="relative flex items-center"><div className="flex-grow border-t border-gray-600"></div><span className="flex-shrink mx-4 text-gray-400">O</span><div className="flex-grow border-t border-gray-600"></div></div>
        
        <form onSubmit={handleJoinRoom} className="space-y-4">
          <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Código de la Sala" maxLength={6} className="w-full bg-gray-800 text-center tracking-widest uppercase rounded-lg p-3" />
          <button type="submit" disabled={isLoading} className="w-full bg-gray-600 hover:bg-gray-500 font-bold py-3 rounded-lg disabled:bg-gray-500">
            {isLoading ? 'Entrando...' : 'Unirse a Sala'}
          </button>
        </form>
      </Card>

      {showTopicsModal && (
        <MyTopics 
          onClose={() => setShowTopicsModal(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default MainMenu;