import { Room, PlayerHandCard } from '../types';
import { API_BASE_URL } from './apiService';

class WebSocketService {
  private ws: WebSocket | null = null;

  public onGameStateUpdate: (data: Room) => void = () => {};
  public onPlayerHandUpdate: (hand: PlayerHandCard[]) => void = () => {};
  public onError: (message: string) => void = () => {};
  public onRoomClosed: (message: string) => void = () => {};

  connect(roomCode: string, token: string) {
    if (this.ws) {
      this.disconnect();
    }
    
    const proto = window.location.protocol === 'https' ? 'wss' : 'ws';
    const host = window.location.host;
    // La ruta del websocket debe coincidir con la de Nginx
    const wsUrl = `${proto}://${host}/ws/game/${roomCode}?token=${token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'game_state_update':
          this.onGameStateUpdate(message.data);
          break;
        case 'player_hand_update':
          this.onPlayerHandUpdate(message.data);
          break;
        case 'error':
          this.onError(message.data.message);
          break;
        case 'room_closed':
          this.onRoomClosed(message.data.message);
          this.disconnect();
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onError('Error de conexión con el servidor del juego.');
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.reason);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
      console.log('WebSocket manually disconnected');
    }
  }

  sendMessage(action: string, payload: object = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action, payload }));
    } else {
      console.error('WebSocket is not connected. Cannot send message.');
      this.onError("No estás conectado al servidor del juego.");
    }
  }
}

export const websocketService = new WebSocketService();