import React, { useState, useCallback, useEffect } from 'react';
import { Disclaimer } from './components/features/rooms/Disclaimer';
import { MainMenu } from './components/features/rooms/MainMenu';
import Lobby from './components/game/Lobby';
import GameBoard from './components/game/GameBoard';
import { Toast } from './components/ui/Toast';
import { Spinner } from './components/ui/Spinner';
import { Header } from './components/layout/Header';
import { GameState, Room, PlayerHandCard } from './types';
import { useAuth } from './context/AuthContext';
import { websocketService } from './services/websocketService';

const App: React.FC = () => {
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<GameState>(GameState.MainMenu);
  const [room, setRoom] = useState<Room | null>(null);
  const [myHand, setMyHand] = useState<PlayerHandCard[]>([]);
  const [toast, setToast] = useState<{ message: string; show: boolean; type: 'success' | 'error' | 'info' }>({ 
    message: '', 
    show: false, 
    type: 'info' 
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { user, accessToken, isLoading: isAuthLoading, logout } = useAuth();

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, show: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, []);

  const resetToMainMenu = useCallback(() => {
    websocketService.disconnect();
    setRoom(null);
    setMyHand([]);
    setCurrentView(GameState.MainMenu);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    resetToMainMenu();
  };

  useEffect(() => {
    websocketService.onGameStateUpdate = (newRoomState) => {
      setRoom(newRoomState);
      const newView = newRoomState.game_state === 'InGame' ? GameState.InGame : GameState.Lobby;
      setCurrentView(newView);
      setIsLoading(false);
    };

    websocketService.onPlayerHandUpdate = (hand) => {
      setMyHand(hand);
    };
    
    websocketService.onError = (message) => {
      showToast(message, 'error');
      setIsLoading(false);
    };

    websocketService.onRoomClosed = (message) => {
      showToast(message, 'info');
      resetToMainMenu();
    };

    return () => {
      websocketService.disconnect();
    };
  }, [showToast, resetToMainMenu]);

  const handleConnectToRoom = (roomData: Room) => {
    if (accessToken) {
      setIsLoading(true);
      websocketService.connect(roomData.code, accessToken);
    } else {
      showToast("Error de autenticación. Intenta iniciar sesión de nuevo.", 'error');
    }
  };

  if (!hasAgreed) {
    return <Disclaimer onAgree={() => setHasAgreed(true)} />;
  }

  const renderContent = () => {
    if (isAuthLoading || isLoading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner text="Cargando..." />
        </div>
      );
    }
    
    switch (currentView) {
      case GameState.Lobby:
        if (!room || !user) return <Spinner text="Cargando sala..." />;
        return <Lobby room={room} currentUser={user} onLeave={resetToMainMenu} showToast={showToast} />;
      
      case GameState.InGame:
        if (!room || !user) return <Spinner text="Cargando partida..." />;
        return <GameBoard room={room} currentUser={user} myHand={myHand} onLeaveGame={resetToMainMenu} />;
      
      case GameState.MainMenu:
      default:
        return <MainMenu showToast={showToast} onRoomConnected={handleConnectToRoom} />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header username={user?.username} onLogout={handleLogout} />
      
      <main className="flex-grow min-h-0 px-8 pt-[100px]">
        <div className={currentView === GameState.Lobby || currentView === GameState.InGame? 'w-full' : 'max-w-7xl mx-auto'}>
          {renderContent()}
        </div>
      </main>

      <Toast message={toast.message} show={toast.show} type={toast.type} />
    </div>
  );
};

export default App;