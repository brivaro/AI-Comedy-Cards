
// --- Tipos de Autenticación ---
export interface UserCreate {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
}

// --- Tipos de Tema ---
export interface Topic {
    id: number;
    title: string;
    prompt: string;
    is_public: boolean;
    owner_username: string;
}

// --- Tipos del Juego ---
export enum GameState {
  MainMenu,
  Lobby,
  InGame,
}

export enum RoundPhase {
  ThemeSelection = "ThemeSelection",
  CardPlaying = "CardPlaying",
  Voting = "Voting",
  RoundOver = "RoundOver",
}

export interface Player {
  id: number;
  username: string;
  score: number;
  is_host: boolean;
  is_theme_master: boolean;
  has_played: boolean;
  is_spectating: boolean;
}

export interface Card {
  id: number;
  text: string;
  card_type: 'response' | 'theme';
}

// Representa una carta en la mano del jugador (viene de la tabla intermedia)
export interface PlayerHandCard {
    id: number; // ID de la entrada en la tabla player_cards
    card: Card; // La carta en sí
}

// Información de una carta que ya ha sido jugada en la mesa
export interface PlayedCardInfo {
  playerId: number;
  playerName: string;
  cardText: string;
}

export interface Room {
  code: string;
  game_state: 'Lobby' | 'InGame';
  topic_id: number | null;
  personality_id: number | null;
  personality: Personality | null;
  theme_master_id: number | null;
  current_theme_card: Card | null;
  round_phase: RoundPhase | null;
  players: Player[];
  played_cards_info: PlayedCardInfo[];
  round_winners: number[];
}
export interface Personality {
    id: number;
    title: string;
    description: string;
}


// --- Tipos para WebSockets ---
export interface PlayerHandUpdateMessage {
    data: PlayerHandCard[];
}