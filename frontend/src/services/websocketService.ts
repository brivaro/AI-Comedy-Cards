import { Room, PlayerHandCard } from '../types';
import { API_BASE_URL } from './apiService';

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
    
    // --- INICIO DE LA CORRECCIÓN ---
    // La lógica original solo funcionaba en localhost.
    // const proto = window.location.protocol === 'https' ? 'wss' : 'ws';
    // const host = window.location.host;
    // const wsUrl = `${proto}://${host}/ws/game/${roomCode}?token=${token}`;
    
    // Lógica NUEVA y CORRECTA para producción:
    if (!API_BASE_URL) {
      console.error("VITE_API_BASE_URL no está definida. La conexión WebSocket fallará.");
      this.onError("Error de configuración: La URL del servidor no está disponible.");
      return;
    }

    // 1. Convertimos la URL de la API HTTP (https://...) a una URL WebSocket (wss://...)
    const wsUrlObject = new URL(API_BASE_URL);
    wsUrlObject.protocol = wsUrlObject.protocol.replace('http', 'ws');
    
    // 2. Construimos la ruta correcta para el endpoint del WebSocket
    wsUrlObject.pathname = `/ws/game/${roomCode}`;
    wsUrlObject.search = `?token=${token}`;

    const wsUrl = wsUrlObject.toString();
    console.log(`Conectando WebSocket a: ${wsUrl}`);
    // --- FIN DE LA CORRECCIÓN ---

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