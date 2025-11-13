import React, { useState, useCallback, useEffect } from 'react';
import Disclaimer from './components/pages/Disclaimer';
import MainMenu from './components/pages/MainMenu';
import Lobby from './components/pages/Lobby';
import GameBoard from './components/pages/GameBoard';
import Toast from './components/common/Toast';
import Spinner from './components/common/Spinner';
import { GameState, Room, PlayerHandCard } from './types';
import { useAuth } from './context/AuthContext';
import { websocketService } from './services/websocketService';

const App: React.FC = () => {
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<GameState>(GameState.MainMenu);
  const [room, setRoom] = useState<Room | null>(null);
  const [myHand, setMyHand] = useState<PlayerHandCard[]>([]);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();

  const showToast = useCallback((message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast(prevState => ({ ...prevState, show: false })), 3000);
  }, []);

  const resetToMainMenu = useCallback(() => {
    websocketService.disconnect();
    setRoom(null);
    setMyHand([]);
    setCurrentView(GameState.MainMenu);
    setIsLoading(false);
  }, []);

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
      showToast(message);
      setIsLoading(false);
    };

    websocketService.onRoomClosed = (message) => {
      showToast(message);
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
      showToast("Error de autenticación. Intenta iniciar sesión de nuevo.");
    }
  };

  if (!hasAgreed) {
    return <Disclaimer onAgree={() => setHasAgreed(true)} />;
  }

  const renderContent = () => {
    if (isAuthLoading || isLoading) return <Spinner text="Cargando..." />;
    
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
  }

  return (
    <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center p-4 font-sans text-brand-secondary">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter">
        AI Comedy Cards
      </h1>
      <div className="w-full max-w-7xl mx-auto">
        {renderContent()}
      </div>
      <Toast message={toast.message} show={toast.show} />
    </div>
  );
};

export default App;