import { Room, PlayerHandCard } from '../types';
import { VITE_WS_BASE_URL } from './apiService';

// Definimos los tipos de acciones y sus payloads
type WebSocketAction = 
  | 'set_game_settings'
  | 'start_game'
  | 'choose_theme_card'
  | 'submit_custom_theme'
  | 'play_card'
  | 'select_winners'
  | 'start_next_round';

interface WebSocketPayloads {
  set_game_settings: { topic_id: number; personality_id: number, total_rounds: number };
  start_game: {};
  choose_theme_card: {};
  submit_custom_theme: { text: string };
  play_card: { player_card_id: number };
  select_winners: { winner_ids: number[] };
  start_next_round: {};
}

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
    
    // 1. Usamos la variable de entorno para producción.
    // 2. Si no existe (estamos en local), construimos la URL localmente.
    const wsBaseUrl = VITE_WS_BASE_URL;

    let wsUrl: string;

    if (wsBaseUrl) {
      // Estamos en producción (Vercel)
      wsUrl = `${wsBaseUrl}/ws/game/${roomCode}?token=${token}`;
    } else {
      // Estamos en desarrollo local
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Apuntamos explícitamente al backend local
      const host = 'localhost:8000'; 
      wsUrl = `${proto}//${host}/ws/game/${roomCode}?token=${token}`;
    }

    console.log(`Conectando WebSocket a: ${wsUrl}`);
    
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

  sendMessage<T extends WebSocketAction>(action: T, payload: WebSocketPayloads[T]) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action, payload }));
    } else {
      console.error('WebSocket is not connected. Cannot send message.');
      this.onError("No estás conectado al servidor del juego.");
    }
  }
}

export const websocketService = new WebSocketService();