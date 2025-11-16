import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { GameState, Room, RoundPhase, User } from '../types';
import * as devMocks from '../mocks/devMocks';

interface DevContextType {
  isDevMode: boolean;
  toggleDevMode: () => void;
  currentView: GameState | null;
  setCurrentView: (view: GameState | null) => void;
  mockUser: User;
  mockRoom: Room;
  isHost: boolean;
  toggleIsHost: () => void;
  isThemeMaster: boolean;
  toggleIsThemeMaster: () => void;
  roundPhase: RoundPhase;
  setRoundPhase: (phase: string) => void;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export const DevProvider = ({ children }: { children: ReactNode }) => {
  const [isDevMode, setIsDevMode] = useState(false);
  const [currentView, setCurrentView] = useState<GameState | null>(GameState.MainMenu);
  const [isHost, setIsHost] = useState(true);
  const [isThemeMaster, setIsThemeMaster] = useState(true);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>(RoundPhase.ThemeSelection);
  
  const toggleDevMode = () => setIsDevMode(prev => !prev);
  const toggleIsHost = () => setIsHost(prev => !prev);
  const toggleIsThemeMaster = () => setIsThemeMaster(prev => !prev);
  
  const mockUser = devMocks.mockUser;

  // Memoize mockRoom to prevent unnecessary re-renders
  const mockRoom = useMemo((): Room => {
    let room;
    switch(currentView) {
        case GameState.Lobby:
            room = devMocks.mockRoomLobby;
            break;
        case GameState.InGame:
            room = { ...devMocks.mockRoomInGame, round_phase: roundPhase };
            break;
        default:
            room = devMocks.mockRoomLobby; // Default fallback
    }

    // Update player roles based on toggles
    const updatedPlayers = room.players.map(p => {
        if (p.id === mockUser.id) {
            return { ...p, is_host: isHost, is_theme_master: isThemeMaster };
        }
        // Ensure only one host/theme master for clarity
        return { ...p, is_host: p.is_host && p.id !== mockUser.id ? false : p.is_host, is_theme_master: p.is_theme_master && p.id !== mockUser.id ? false : p.is_theme_master };
    });

    return { ...room, players: updatedPlayers, theme_master_id: isThemeMaster ? mockUser.id : 2 };
  }, [currentView, isHost, isThemeMaster, roundPhase]);


  return (
    <DevContext.Provider value={{ 
        isDevMode, 
        toggleDevMode, 
        currentView, 
        setCurrentView: (view) => setCurrentView(view as GameState), 
        mockUser,
        mockRoom,
        isHost,
        toggleIsHost,
        isThemeMaster,
        toggleIsThemeMaster,
        roundPhase,
        setRoundPhase: (phase) => setRoundPhase(phase as RoundPhase)
    }}>
      {children}
    </DevContext.Provider>
  );
};

export const useDev = () => {
  const context = useContext(DevContext);
  if (context === undefined) {
    throw new Error('useDev must be used within a DevProvider');
  }
  return context;
};