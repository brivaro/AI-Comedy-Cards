import { User, Room, PlayerHandCard, Topic, Personality, RoundPhase, GameState } from '../types';

export const mockUser: User = {
  id: 1,
  username: 'DevUser',
};

export const mockPlayers: Room['players'] = [
  { id: 1, username: 'DevUser', score: 100, is_host: true, is_theme_master: true, has_played: false, is_spectating: false },
  { id: 2, username: 'Player2', score: 80, is_host: false, is_theme_master: false, has_played: true, is_spectating: false },
  { id: 3, username: 'Player3', score: 120, is_host: false, is_theme_master: false, has_played: false, is_spectating: false },
  { id: 4, username: 'Spectator', score: 0, is_host: false, is_theme_master: false, has_played: false, is_spectating: true },
];

export const mockMyHand: PlayerHandCard[] = [
  { id: 101, card: { id: 201, text: 'Una guillotina bien engrasada.', card_type: 'response' } },
  { id: 102, card: { id: 202, text: 'El capitalismo tardío.', card_type: 'response' } },
  { id: 103, card: { id: 203, text: 'Un plot twist que nadie vio venir.', card_type: 'response' } },
  { id: 104, card: { id: 204, text: 'Beber directamente del cartón de leche.', card_type: 'response' } },
  { id: 105, card: { id: 205, text: 'El amigo que siempre se ofrece a ayudar con la mudanza pero luego no aparece.', card_type: 'response' } },
];

export const mockPlayedCards: Room['played_cards_info'] = [
    { playerId: 2, playerName: 'Player2', cardText: 'La ansiedad de los domingos por la tarde.'},
    { playerId: 3, playerName: 'Player3', cardText: 'Fingir que estás poniendo atención en una reunión de Zoom.'},
];

export const mockPersonality: Personality = {
  id: 1,
  title: 'Sarcástico y Cansado',
  description: 'Una IA que lo ha visto todo y ya nada le impresiona. Sus respuestas son ácidas y con un toque de apatía.',
};

export const mockTopic: Topic = {
    id: 1,
    title: "Humor de Oficina",
    prompt: "Genera cartas sobre situaciones típicas de la vida en la oficina, como reuniones interminables, el robo de tuppers en la nevera y correos pasivo-agresivos.",
    is_public: true,
    owner_username: "admin"
};

export const mockRoomBase: Omit<Room, 'game_state' | 'round_phase'> = {
  code: 'DEV123',
  topic_id: 1,
  personality_id: 1,
  personality: mockPersonality,
  theme_master_id: 1,
  current_theme_card: { id: 301, text: 'La reunión de las 9 AM podría haber sido un email sobre ______.', card_type: 'theme' },
  players: mockPlayers,
  played_cards_info: [],
  round_winners: [],
};

export const mockRoomLobby: Room = {
    ...mockRoomBase,
    game_state: 'Lobby',
    round_phase: null,
};

export const mockRoomInGame: Room = {
    ...mockRoomBase,
    game_state: 'InGame',
    round_phase: RoundPhase.ThemeSelection,
    played_cards_info: mockPlayedCards,
    round_winners: [3, 2, 1]
};

export const mockTopics: Topic[] = [
    mockTopic,
    { id: 2, title: 'Cultura Pop de los 90', prompt: 'Referencias a series, música y eventos de los años 90.', is_public: true, owner_username: 'admin' },
    { id: 3, title: 'Miscelánea Absurda (Privado)', prompt: 'Temas completamente aleatorios y sin sentido.', is_public: false, owner_username: 'DevUser' },
];

export const mockPersonalities: Personality[] = [
    mockPersonality,
    { id: 2, title: 'Dramático y Exagerado', description: 'Una IA que convierte todo en una telenovela.' },
    { id: 3, title: 'Como un Niño de 5 Años', description: 'Respuestas inocentes, directas y a veces brutalmente honestas.' },
];