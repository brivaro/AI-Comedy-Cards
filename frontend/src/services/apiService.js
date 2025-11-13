import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL || '/api/v1',
});

// Interceptor para añadir el token de autenticación a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Funciones de Autenticación ---
export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const login = (username, password) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  return api.post('/auth/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const getCurrentUser = () => {
  return api.get('/auth/users/me');
};

// --- Funciones de Salas (Rooms) ---
export const createRoom = () => {
    return api.post('/rooms/');
};

export const joinRoom = (room_code) => {
    return api.post(`/rooms/${room_code}/join`);
};

// --- Funciones de Temas (Topics) ---
export const createTopic = (title, prompt, is_public) => {
    return api.post('/topics/', { title, prompt, is_public });
};

export const getMyTopics = () => {
    return api.get('/topics/me');
};

export const getPublicTopics = () => {
    return api.get('/topics/public');
};