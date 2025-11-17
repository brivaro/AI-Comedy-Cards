import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import * as apiService from '../services/apiService';
import { User, UserCreate } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (username: any, password: any) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- INICIO DE LA CORRECCIÓN 1: Estabilizar handleLogout ---
  // Envolvemos handleLogout en useCallback para que no se cree en cada render.
  // El array de dependencias está vacío porque no depende de nada externo.
  const handleLogout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('activeRoomCode');
    sessionStorage.removeItem('lastRoomData');
  }, []);
  // --- FIN DE LA CORRECCIÓN 1 ---

  // --- INICIO DE LA CORRECCIÓN 2: Corregir dependencias de fetchUser ---
  // Ahora que handleLogout es estable, podemos añadirla como dependencia de fetchUser.
  const fetchUser = useCallback(async (token: string) => {
    try {
      const response = await apiService.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error("Session expired or invalid token", error);
      handleLogout(); // Ahora llama a la versión estable y correcta.
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]); // <-- Se añade la dependencia
  // --- FIN DE LA CORRECCIÓN 2 ---

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]); // <-- La dependencia ya estaba correcta aquí

  const handleLogin = async (username: any, password: any) => {
    const response = await apiService.login(username, password);
    const { access_token } = response.data;
    localStorage.setItem('accessToken', access_token);
    setAccessToken(access_token);
    setIsLoading(true);
    await fetchUser(access_token);
  };

  const handleRegister = async (userData: UserCreate) => {
    await apiService.register(userData);
    await handleLogin(userData.username, userData.password);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login: handleLogin, register: handleRegister, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};