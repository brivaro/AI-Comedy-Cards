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
import AIRobotLoader from './components/ui/AIRobotLoader'; 
// DEV IMPORTS
import { useDev } from './context/DevContext';
import { DevPanel } from './components/dev/DevPanel';
import * as devMocks from './mocks/devMocks';

const App: React.FC = () => {
  const [hasAgreed, setHasAgreed] = useState<boolean>(() => {
    return localStorage.getItem('disclaimerAgreed') === 'true';
  });
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
  // DEV HOOK
  const dev = useDev();

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // En modo dev, también se muestra en la consola
    if (dev.isDevMode) console.log(`[DEV TOAST - ${type.toUpperCase()}]: ${message}`);
    setToast({ message, show: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  }, [dev.isDevMode]);

  const resetToMainMenu = useCallback(() => {
    if (!dev.isDevMode) {
      websocketService.disconnect();
    }
    setRoom(null);
    setMyHand([]);
    setCurrentView(GameState.MainMenu);
    setIsLoading(false);
  }, [dev.isDevMode]);

  const handleLogout = () => {
    logout();
    resetToMainMenu();
  };

  useEffect(() => {
    if (dev.isDevMode) return; // No configurar websockets en modo dev

    websocketService.onGameStateUpdate = (newRoomState) => {
      setRoom(newRoomState);

      if (newRoomState.game_state !== 'Generating') {
        const newView = newRoomState.game_state === 'InGame' ? GameState.InGame : GameState.Lobby;
        setCurrentView(newView);
        setIsLoading(false);
      }
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
  }, [showToast, resetToMainMenu, dev.isDevMode]);

  const handleConnectToRoom = (roomData: Room) => {
    if (dev.isDevMode) {
        setIsLoading(true);
        setTimeout(() => {
            setCurrentView(GameState.Lobby);
            setIsLoading(false);
        }, 500);
        return;
    }
    if (accessToken) {
      setIsLoading(true);
      websocketService.connect(roomData.code, accessToken);
    } else {
      showToast("Error de autenticación. Intenta iniciar sesión de nuevo.", 'error');
    }
  };
  
  useEffect(() => {
    if (dev.isDevMode) {
      setHasAgreed(true);
    }
  }, [dev.isDevMode]);

  const handleAgreeToDisclaimer = () => {
    localStorage.setItem('disclaimerAgreed', 'true');
    setHasAgreed(true);
  };

  if (!hasAgreed) {
    if (dev.isDevMode && dev.currentView !== null) {
      // no hacer nada
    } else {
       return <Disclaimer onAgree={handleAgreeToDisclaimer} />;
    }
  }

  const renderContent = () => {
    // LÓGICA DE RENDERIZADO EN MODO DEV
    if (dev.isDevMode) {
      const devView = dev.currentView;
      const devShowToast = (msg: string, type: any = 'info') => console.log(`[DEV TOAST - ${type.toUpperCase()}]: ${msg}`);
      
      if (devView === null) {
          return <Disclaimer onAgree={() => dev.setCurrentView(GameState.MainMenu)} />;
      }

      switch (devView) {
        case GameState.Lobby:
          return <Lobby room={dev.mockRoom} currentUser={dev.mockUser} onLeave={() => dev.setCurrentView(GameState.MainMenu)} showToast={devShowToast} />;
        
        case GameState.InGame:
          return <GameBoard room={dev.mockRoom} currentUser={dev.mockUser} myHand={devMocks.mockMyHand} onLeaveGame={() => dev.setCurrentView(GameState.MainMenu)} />;
        
        case GameState.MainMenu:
        default:
          return <MainMenu showToast={devShowToast} onRoomConnected={() => dev.setCurrentView(GameState.Lobby)} />;
      }
    }
    
    // LÓGICA DE RENDERIZADO ORIGINAL
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

  const activeUser = dev.isDevMode ? dev.mockUser : user;
  const viewForLayout = dev.isDevMode ? (dev.currentView ?? GameState.MainMenu) : currentView;
  const headerVariant = (viewForLayout === GameState.Lobby || viewForLayout === GameState.InGame) 
    ? 'solid' 
    : 'glass';

  return (
    <div className="h-screen flex flex-col">
      <Header username={activeUser?.username} onLogout={dev.isDevMode ? undefined : handleLogout} variant={headerVariant} />
      
      <main className="flex-grow min-h-0 px-8 pt-[100px] pb-8">
        <div className={`${viewForLayout === GameState.Lobby || viewForLayout === GameState.InGame ? 'w-full' : 'max-w-7xl mx-auto'} h-full`}>
          {renderContent()}
        </div>
      </main>

      {room?.game_state === 'Generating' && !dev.isDevMode && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in">
          <AIRobotLoader />
        </div>
      )}

      <Toast message={toast.message} show={toast.show} type={toast.type} />
      <DevPanel />
    </div>
  );
};

export default App;