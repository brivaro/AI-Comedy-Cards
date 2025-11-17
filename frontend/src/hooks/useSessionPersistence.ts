import { useState, useCallback, useMemo } from 'react';
import { Room } from '../types';
import * as apiService from '../services/apiService';

interface SessionState {
  roomCode: string | null;
  lastRoomData: Room | null;
  isRecoveringSession: boolean;
}

export const useSessionPersistence = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    roomCode: null,
    lastRoomData: null,
    isRecoveringSession: false,
  });

  const saveSession = useCallback((room: Room) => {
    try {
      sessionStorage.setItem('activeRoomCode', room.code);
      sessionStorage.setItem('lastRoomData', JSON.stringify(room));
      setSessionState({
        roomCode: room.code,
        lastRoomData: room,
        isRecoveringSession: false,
      });
    } catch (error) {
      console.error('Error saving session to storage:', error);
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem('activeRoomCode');
      sessionStorage.removeItem('lastRoomData');
      setSessionState({
        roomCode: null,
        lastRoomData: null,
        isRecoveringSession: false,
      });
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }, []);

  const recoverSession = useCallback(async (): Promise<Room | null> => {
    try {
      setSessionState(prev => ({ ...prev, isRecoveringSession: true }));
      const savedRoomCode = sessionStorage.getItem('activeRoomCode');
      if (!savedRoomCode) {
        setSessionState(prev => ({ ...prev, isRecoveringSession: false }));
        return null;
      }
      try {
        const response = await apiService.getActiveRoom();
        const activeRoom = response.data;
        setSessionState({
          roomCode: activeRoom.code,
          lastRoomData: activeRoom,
          isRecoveringSession: false,
        });
        console.log(`✅ Sesión recuperada. Sala activa: ${activeRoom.code}`);
        return activeRoom;
      } catch (serverError: any) {
        if (serverError.response?.status === 404) {
          console.log('Sala activa no encontrada en el servidor. Limpiando sesión local.');
          clearSession();
          return null;
        }
        throw serverError;
      }
    } catch (error) {
      console.error('Error recovering session:', error);
      setSessionState(prev => ({ ...prev, isRecoveringSession: false }));
      return null;
    }
  }, [clearSession]);

  // --- INICIO DE LA CORRECCIÓN ---
  // Se elimina el `useMemo` que causaba el bucle.
  // Devolvemos directamente los valores del estado y las funciones estables.
  // De esta manera, `saveSession`, `clearSession`, y `recoverSession`
  // SIEMPRE tendrán la misma referencia, rompiendo el bucle del useEffect.
  return {
    roomCode: sessionState.roomCode,
    lastRoomData: sessionState.lastRoomData,
    isRecoveringSession: sessionState.isRecoveringSession,
    saveSession,
    clearSession,
    recoverSession,
  };
  // --- FIN DE LA CORRECCIÓN ---
};